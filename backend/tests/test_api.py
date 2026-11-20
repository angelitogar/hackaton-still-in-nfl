import asyncio
import httpx
import pandas as pd
from backend import analysis
from backend.main import app


def request(method, path, **kwargs):
    async def run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
            return await client.request(method, path, **kwargs)
    return asyncio.run(run())


def test_actual_data_and_summary_match_source():
    games, _, plays = analysis.load()
    actual = plays[plays.possessionTeam == 'KC']
    result = analysis.diagnosis('KC', 'offense')
    assert result['sample']['plays'] == len(actual)
    assert result['summary']['avgPlayResult'] == actual.playResult.mean()
    assert result['sample']['games'] == actual.gameId.nunique()
    assert len(games) > 0


def test_field_zone_is_based_on_possession_side():
    _, _, plays = analysis.load()
    usable = plays[(plays.yardlineSide == plays.possessionTeam) & plays.yardlineNumber.between(1, 20)]
    assert not usable.empty
    assert (usable.fieldZone == 'ownTerritory').all()
    red_zone = plays[(plays.yardlineSide != plays.possessionTeam) & plays.yardlineSide.notna() & plays.yardlineNumber.between(1, 20)]
    assert not red_zone.empty
    assert (red_zone.fieldZone == 'redZone').all()


def test_offense_and_defense_sample_and_thresholds():
    _, _, plays = analysis.load()
    for perspective, column in [('offense', 'possessionTeam'), ('defense', 'defensiveTeam')]:
        rows = analysis.slice_rows('KC', perspective, 'down')
        for row in rows:
            selected = plays[(plays[column] == 'KC') & (plays.down == row['bucket'])]
            assert row['n'] == len(selected) >= 20
            assert abs(row['avgPlayResult'] - selected.playResult.mean()) < 1e-9
            assert row['sampleFlag'] == ('ok' if len(selected) >= 50 else 'low')
            if len(selected) < 50:
                assert row['verdict'] == 'inconclusive'


def test_api_contract_and_invalid_requests():
    assert request('GET', '/health').json() == {'status': 'ok'}
    assert request('GET', '/api/meta').json()['dataset']['plays'] == len(analysis.load()[2])
    assert request('GET', '/api/teams/INVALID/diagnosis').status_code == 404
    assert request('GET', '/api/teams/KC/slices?dimension=invalid').json()['error']['code'] == 'INVALID_PARAMETER'


def test_scenario_manual_assumptions_do_not_change_evidence():
    rows = analysis.slice_rows('KC', 'offense', 'down')
    row = next(r for r in rows if r['sampleFlag'] == 'ok')
    base = {'team': 'KC', 'strategy': 'rebuild', 'need': {'dimension': 'down', 'bucket': row['bucket'], 'perspective': 'offense'}}
    first = request('POST', '/api/scenarios/preview', json=base)
    second = request('POST', '/api/scenarios/preview', json={**base, 'manualRecord': {'season': 2025, 'wins': 10, 'losses': 7}})
    assert first.status_code == second.status_code == 200
    assert first.json()['evidence'] == second.json()['evidence']
    assert any('manual' in text for text in second.json()['assumptions'])
    assert 'hipotético' in second.json()['disclaimers'][0].lower()


def test_fictional_rosters_and_balanced_scenario():
    assert analysis.fictional_roster('KC') == analysis.fictional_roster('KC')
    assert analysis.fictional_roster('KC') != analysis.fictional_roster('ARI')
    row = next(row for row in analysis.slice_rows('KC', 'offense', 'down') if row['sampleFlag'] == 'ok')
    payload = {'team': 'KC', 'strategy': 'balanced', 'need': {'dimension': 'down', 'bucket': row['bucket'], 'perspective': 'offense'}, 'targetPosition': 'WR', 'manualRecord': {'season': 2026, 'wins': 0, 'losses': 6}}
    result = request('POST', '/api/scenarios/preview', json=payload)
    assert result.status_code == 200
    profiles = result.json()['partnerProfiles']
    assert len(profiles) == 31 and all(p['team'] != 'KC' for p in profiles)
    assert [p['simulation']['rank'] for p in profiles] == list(range(1, 32))
    scores = [p['simulation']['fitScore'] for p in profiles]
    assert scores == sorted(scores, reverse=True) and all(0 <= score <= 100 for score in scores)
    assert all(p['simulation']['targetPosition'] == 'WR' for p in profiles)
    assert all('fictici' in p['simulation']['draftPicks'] for p in profiles)
    assert all(p['simulation']['ourCount'] >= 1 for p in profiles)


def test_simulated_positions_include_offensive_line():
    row = next(row for row in analysis.slice_rows('KC', 'offense', 'down') if row['sampleFlag'] == 'ok')
    payload = {'team': 'KC', 'strategy': 'balanced', 'need': {'dimension': 'down', 'bucket': row['bucket'], 'perspective': 'offense'}, 'targetPosition': 'OL'}
    result = request('POST', '/api/scenarios/preview', json=payload).json()
    assert all(p['simulation']['targetPosition'] == 'OL' for p in result['partnerProfiles'])


def test_every_team_has_an_explorable_need_without_fabricating_a_verdict():
    for team in analysis.meta()['teams']:
        for perspective in ('offense', 'defense'):
            needs = analysis.diagnosis(team, perspective)['attention']
            assert needs, f'{team} {perspective} has no need'
            for item in needs:
                assert item['sampleFlag'] == 'ok'
                if item.get('fallback'):
                    assert 'Prioridad relativa' in item['explanation']
                    assert item['verdict'] != 'adverse'
                else:
                    assert item['verdict'] == 'adverse'


def test_minimal_priority_is_explorable_and_late_pick_is_hypothetical():
    priority = next(
        (team, perspective, item)
        for team in analysis.meta()['teams']
        for perspective in ('offense', 'defense')
        for item in analysis.diagnosis(team, perspective)['attention']
        if item.get('fallback')
    )
    team, perspective, item = priority
    payload = {'team': team, 'strategy': 'rebuild', 'need': {'dimension': item['dimension'], 'bucket': item['bucket'], 'perspective': perspective}}
    response = request('POST', '/api/scenarios/preview', json=payload)
    assert response.status_code == 200
    assert 'quinta o sexta ronda' in response.json()['partnerProfiles'][0]['simulation']['draftProposal']
    assert 'no es una valoración real' in response.json()['partnerProfiles'][0]['simulation']['draftProposal']
