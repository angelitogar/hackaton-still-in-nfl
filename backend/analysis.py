"""Historical pass-play analysis. Original CSV files remain read-only."""
from functools import lru_cache
from hashlib import sha256
from pathlib import Path
import numpy as np
import pandas as pd

DATA = Path(__file__).resolve().parent.parent / 'data'
DIMENSIONS = ['down', 'distanceBucket', 'quarter', 'clockWindow', 'fieldZone', 'offenseFormation', 'playAction', 'coverageType']
THRESHOLDS = {'minDisplay': 20, 'minFinding': 50, 'explosiveYards': 20}
LIMITS = [
    'Muestra histórica de jugadas de pase de 2021, semanas 1–8; no representa todas las jugadas ni plantillas actuales.',
    'Sin contratos, salarios, disponibilidad, agentes libres, selecciones del draft ni valor de mercado.',
    'No se puede atribuir un resultado de equipo a un jugador o posición ni demostrar que un equipo aceptaría un trade.',
    'Las comparaciones son exploratorias; múltiples segmentos y muestras pequeñas pueden producir diferencias por azar.',
]

@lru_cache(maxsize=1)
def load():
    games = pd.read_csv(DATA / 'games.csv')
    players = pd.read_csv(DATA / 'players.csv')
    plays = pd.read_csv(DATA / 'plays.csv')
    plays = plays.merge(games[['gameId', 'season', 'week']], on='gameId', validate='many_to_one')
    plays = plays.loc[(plays.season == 2021) & (plays.week <= 8)].copy()
    plays['down'] = plays['down'].astype(str)
    plays['quarter'] = plays['quarter'].astype(str)
    plays['distanceBucket'] = np.select([plays.yardsToGo <= 3, plays.yardsToGo <= 7], ['short', 'medium'], default='long')
    seconds = pd.to_timedelta('00:' + plays.gameClock.astype(str), errors='coerce').dt.total_seconds()
    plays['clockWindow'] = np.select([(plays.quarter == '4') & (seconds <= 300), plays.quarter == '4'], ['q4Last5', 'q4Full'], default='rest')
    # Use possession and field side to derive distance to the opponent end zone.
    number = pd.to_numeric(plays.yardlineNumber, errors='coerce')
    valid = number.between(0, 50)
    same_side = plays.yardlineSide == plays.possessionTeam
    other_side = plays.yardlineSide.notna() & ~same_side
    distance = pd.Series(np.nan, index=plays.index, dtype=float)
    distance.loc[valid & same_side] = 100 - number.loc[valid & same_side]
    distance.loc[valid & other_side] = number.loc[valid & other_side]
    distance.loc[valid & plays.yardlineSide.isna() & (number == 50)] = 50
    plays['fieldZone'] = np.select([distance <= 20, distance < 50, distance.notna()], ['redZone', 'opponentTerritory', 'ownTerritory'], default='unknown')
    plays['playAction'] = plays.pff_playAction.fillna(-1).astype(int).astype(str)
    plays['coverageType'] = plays.pff_passCoverageType.fillna('unknown').astype(str)
    plays['offenseFormation'] = plays.offenseFormation.fillna('unknown').astype(str)
    plays['result'] = pd.to_numeric(plays.playResult, errors='coerce')
    plays = plays.dropna(subset=['result'])
    return games, players, plays

def team_col(perspective):
    return 'possessionTeam' if perspective == 'offense' else 'defensiveTeam'

def meta():
    games, players, plays = load()
    return {'season': 2021, 'weeks': {'min': int(plays.week.min()), 'max': int(plays.week.max())},
            'teams': sorted(set(games.homeTeamAbbr) | set(games.visitorTeamAbbr)),
            'positions': sorted(players.officialPosition.dropna().unique().tolist()), 'dimensions': DIMENSIONS,
            'thresholds': THRESHOLDS, 'dataset': {'games': len(games), 'plays': len(plays), 'players': len(players)}, 'limits': LIMITS}

def percentile(value, reference, perspective):
    # Higher percentile means better for that perspective.
    values = reference.to_numpy()
    return float(100 * np.mean(values <= value if perspective == 'offense' else values >= value))

def slice_rows(team, perspective, dimension):
    _, _, plays = load()
    col = team_col(perspective)
    own = plays[plays[col] == team]
    rows = []
    for bucket, group in own.groupby(dimension, dropna=False):
        n = len(group)
        if n < THRESHOLDS['minDisplay']:
            continue
        peers = plays[plays[dimension] == bucket].groupby(col).result.agg(['mean', 'count'])
        # Exclude insufficient peer samples from the comparison.
        peers = peers.loc[peers['count'] >= THRESHOLDS['minDisplay'], 'mean']
        if peers.empty:
            continue
        values = group.result
        mean, med = float(values.mean()), float(peers.median())
        se = float(values.std(ddof=1) / np.sqrt(n))
        low, high = mean - 1.96 * se, mean + 1.96 * se
        verdict = 'inconclusive'
        if n >= THRESHOLDS['minFinding'] and (high < med or low > med):
            favorable = mean > med if perspective == 'offense' else mean < med
            verdict = 'favorable' if favorable else 'adverse'
        rows.append({'dimension': dimension, 'bucket': str(bucket), 'n': n, 'avgPlayResult': mean,
                     'explosiveRate': float((values >= 20).mean()), 'negativeRate': float((values < 0).mean()),
                     'ci': {'low': low, 'high': high}, 'leagueMedian': med, 'diff': mean-med,
                     'percentile': percentile(mean, peers, perspective), 'sampleFlag': 'ok' if n >= 50 else 'low', 'verdict': verdict})
    return rows

@lru_cache(maxsize=128)
def diagnosis(team, perspective):
    _, _, plays = load()
    col = team_col(perspective)
    own = plays[plays[col] == team]
    peer = plays.groupby(col).result.mean()
    rows = [row for d in DIMENSIONS for row in slice_rows(team, perspective, d)]
    def findings(verdict):
        ranked = sorted((r for r in rows if r['verdict'] == verdict), key=lambda r: abs(r['diff']), reverse=True)[:3]
        return [{**r, 'rank': i+1, 'explanation': 'Diferencia exploratoria respecto a la mediana de equipos con muestra suficiente; no demuestra causalidad.'} for i, r in enumerate(ranked)]
    attention = findings('adverse')
    if not attention:
        eligible = [row for row in rows if row['sampleFlag'] == 'ok']
        if eligible:
            # Least favorable comparison, even when all differences are positive.
            weakest = min(eligible, key=lambda row: row['diff'] if perspective == 'offense' else -row['diff'])
            attention = [{**weakest, 'rank': 1, 'fallback': True,
                          'explanation': 'Prioridad relativa de exploración: es el segmento menos favorable disponible, no una debilidad demostrada ni una valoración de mercado.'}]
    mixes = []
    for label in sorted(plays.passResult.dropna().unique()):
        per_team = plays.assign(match=(plays.passResult == label)).groupby(col)['match'].mean()
        mixes.append({'label': label, 'share': float((own.passResult == label).mean()), 'leagueMedian': float(per_team.median()), 'n': len(own)})
    mean = float(own.result.mean())
    return {'team': team, 'perspective': perspective, 'season': 2021, 'sample': {'plays': len(own), 'games': int(own.gameId.nunique())},
            'summary': {'avgPlayResult': mean, 'leagueMedian': float(peer.median()), 'percentile': percentile(mean, peer, perspective)},
            'attention': attention, 'strengths': findings('favorable'), 'outcomeMix': mixes,
            'caveats': LIMITS + ['Intervalos aproximados y comparaciones múltiples: no son pruebas causales ni inferencias confirmatorias.', 'La zona de campo se calcula a partir de yardlineSide, yardlineNumber y possessionTeam.']}

SIM_POSITIONS = ('QB', 'RB', 'WR', 'TE', 'OL', 'CB', 'DE', 'LB')

def fictional_roster(team):
    """Reproducible simulated roster; no identity or real membership implied."""
    roster = {}
    for position in SIM_POSITIONS:
        digest = sha256(f'{team}:{position}'.encode()).digest()
        count = 1 + digest[0] % 3
        roster[position] = [f'Player {int.from_bytes(digest[1:5], "big") % 90000 + 10000}-{i+1}' for i in range(count)]
    return roster

def scenario(request):
    team, need = request['team'], request['need']
    matches = [r for r in slice_rows(team, need['perspective'], need['dimension']) if r['bucket'] == need['bucket'] and r['sampleFlag'] == 'ok']
    if not matches:
        return None
    priority = next((item for item in diagnosis(team, need['perspective'])['attention']
                     if item['dimension'] == need['dimension'] and item['bucket'] == need['bucket']), None)
    minimal = bool(priority and priority.get('fallback'))
    partners = []
    selected = request.get('partnerTeam')
    our_roster = fictional_roster(team)
    target = request.get('targetPosition') or 'WR'
    if target not in SIM_POSITIONS:
        target = 'WR'
    for candidate in ([selected] if selected else meta()['teams']):
        if candidate == team:
            continue
        row = next((r for r in slice_rows(candidate, need['perspective'], need['dimension']) if r['bucket'] == need['bucket']), None)
        their_roster = fictional_roster(candidate)
        # Fictional weakness: fewest synthetic players, never a real roster assertion.
        their_need = min(SIM_POSITIONS, key=lambda pos: (len(their_roster[pos]), pos))
        offer_count = len(our_roster[their_need])
        target_count = len(their_roster[target])
        weaknesses = sum(1 for item in diagnosis(candidate, need['perspective'])['attention'] if not item.get('fallback'))
        score = round((weaknesses / 3) * 35 + (35 if offer_count > 1 else 0) + (20 if target_count > 1 else 0) + (10 if row and row['verdict'] == 'adverse' else 0))
        offer = our_roster[their_need][0] if offer_count > 1 else None
        receiving = their_roster[target][0] if target_count > 1 else None
        partners.append({'team': candidate, 'slice': row, 'source': 'manual' if selected else 'computed',
                         'note': 'Plantillas y necesidades por posición simuladas; la comparación de jugadas es histórica. No implica disponibilidad ni aceptación.',
                         'simulation': {'theirNeed': their_need, 'ourCount': offer_count, 'theirTargetCount': target_count,
                                        'targetPosition': target, 'offerPlayer': offer, 'receivePlayer': receiving, 'weaknessCount': weaknesses,
                                        'draftProposal': ('Prioridad relativa pequeña: explorar hipotéticamente una selección de quinta o sexta ronda; no es una valoración real.' if minimal else ('Explorar ofrecer un jugador ficticio y solicitar una selección futura de primera ronda.' if offer else 'Sin excedente simulado para ofrecer: define otro activo antes de pedir una selección.') if request['strategy'] == 'rebuild' else ('Explorar ofrecer una selección futura de primera ronda a cambio del jugador ficticio.' if receiving else 'Sin excedente simulado en la posición buscada: elige otro socio.') if request['strategy'] == 'compete' else 'Explorar jugadores ficticios y una selección futura como parte de una negociación simulada.'),
                                        'draftPicks': 'Cada equipo tiene ficticiamente una selección por ronda. Para una prioridad relativa pequeña se puede explorar una selección simulada de quinta o sexta ronda, sin asignar un valor real.',
                                        'fitScore': score}})
    partners.sort(key=lambda p: (-p['simulation']['fitScore'], p['team']))
    for i, partner in enumerate(partners):
        partner['simulation']['rank'] = i + 1
    assumptions = [f"Estrategia: {request['strategy']} (selección manual).",
                   'Plantillas, jugadores y necesidades por posición son ficticios; cada equipo tiene una selección por ronda.',
                   'La posición simulada no se deduce de las jugadas históricas.']
    if minimal:
        assumptions.append('Necesidad mínima: prioridad relativa exploratoria, sin evidencia concluyente ni valoración de mercado.')
    for key, title in [('targetPosition', 'Posición objetivo'), ('partnerTeam', 'Equipo elegido')]:
        if request.get(key): assumptions.append(f'{title}: {request[key]} (dato manual).')
    if request.get('manualRecord'):
        rec = request['manualRecord']
        assumptions.append(f"Récord {rec['wins']}-{rec['losses']}-{rec.get('ties', 0)} de {rec['season']} (dato manual no verificado).")
    return {'evidence': matches, 'partnerProfiles': partners, 'assumptions': assumptions, 'missingData': LIMITS,
            'disclaimers': ['Escenario hipotético con jugadores ficticios: no es una recomendación de trade.', 'No se afirma disponibilidad, valor, viabilidad ni aceptación.']}
