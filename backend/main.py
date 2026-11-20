"""API de diagnóstico histórico para NFL TRADE BOWL."""
from typing import Literal
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from backend import analysis

app = FastAPI(title='NFL TRADE BOWL')
Perspective = Literal['offense', 'defense']
Dimension = Literal['down', 'distanceBucket', 'quarter', 'clockWindow', 'fieldZone', 'offenseFormation', 'playAction', 'coverageType']

class Need(BaseModel):
    dimension: Dimension
    bucket: str = Field(min_length=1, max_length=100)
    perspective: Perspective

class Record(BaseModel):
    season: int = Field(ge=1920, le=2100)
    wins: int = Field(ge=0, le=30)
    losses: int = Field(ge=0, le=30)
    ties: int = Field(default=0, ge=0, le=30)

class Scenario(BaseModel):
    team: str
    strategy: Literal['compete', 'rebuild']
    need: Need
    targetPosition: str | None = Field(default=None, max_length=40)
    partnerTeam: str | None = None
    manualRecord: Record | None = None
    futureAssetNote: str | None = Field(default=None, max_length=280)

def error(code, message, status=422):
    return JSONResponse(status_code=status, content={'error': {'code': code, 'message': message, 'details': {}}})

@app.exception_handler(RequestValidationError)
async def invalid_request(request: Request, exc: RequestValidationError):
    return error('INVALID_PARAMETER', 'Parámetros inválidos. Revisa el equipo, la dimensión y los datos del escenario.')

@app.exception_handler(FileNotFoundError)
async def missing_data(request: Request, exc: FileNotFoundError):
    return error('DATA_UNAVAILABLE', 'Faltan archivos de datos necesarios en data/.', 503)

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.get('/api/meta')
async def meta():
    return analysis.meta()

@app.get('/api/teams/{team}/diagnosis')
async def diagnosis(team: str, perspective: Perspective = 'offense'):
    if team not in analysis.meta()['teams']:
        return error('TEAM_NOT_FOUND', 'Equipo no encontrado en la muestra.', 404)
    return analysis.diagnosis(team, perspective)

@app.get('/api/teams/{team}/slices')
async def slices(team: str, dimension: Dimension, perspective: Perspective = 'offense'):
    if team not in analysis.meta()['teams']:
        return error('TEAM_NOT_FOUND', 'Equipo no encontrado en la muestra.', 404)
    return {'dimension': dimension, 'rows': analysis.slice_rows(team, perspective, dimension)}

@app.post('/api/scenarios/preview')
async def preview(body: Scenario):
    data = body.model_dump(exclude_none=True)
    teams = analysis.meta()['teams']
    if body.team not in teams or (body.partnerTeam and body.partnerTeam not in teams):
        return error('TEAM_NOT_FOUND', 'Equipo no encontrado en la muestra.', 404)
    result = analysis.scenario(data)
    return result if result is not None else error('INSUFFICIENT_SAMPLE', 'La selección no tiene muestra suficiente para generar un escenario.')
