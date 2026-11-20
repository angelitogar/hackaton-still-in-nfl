#!/bin/sh
# Inicia los servicios que falten; conserva esta terminal abierta.
set -eu
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ] || [ ! -x .hackathon/.tools/node/bin/npm ]; then
  printf '%s\n' 'Falta el entorno del hackatón. Ejecuta el instalador oficial antes de iniciar.' >&2
  exit 1
fi
export PATH="$PWD/.hackathon/.tools/node/bin:$PATH"
export OPENBLAS_NUM_THREADS=1
backend_pid=''
frontend_pid=''
cleanup() {
  [ -z "$backend_pid" ] || kill "$backend_pid" 2>/dev/null || true
  [ -z "$frontend_pid" ] || kill "$frontend_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
if curl -fsS --max-time 2 http://127.0.0.1:8000/health >/dev/null 2>&1; then
  printf '%s\n' 'Backend ya disponible.'
else
  .venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
  backend_pid=$!
  attempts=0
  until curl -fsS --max-time 2 http://127.0.0.1:8000/health >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 15 ] || ! kill -0 "$backend_pid" 2>/dev/null; then
      printf '%s\n' 'No se pudo iniciar el backend. Revisa los mensajes de esta terminal.' >&2
      exit 1
    fi
    sleep 1
  done
fi
if curl -fsS --max-time 2 http://127.0.0.1:5173/ >/dev/null 2>&1; then
  printf '%s\n' 'Interfaz ya disponible en http://127.0.0.1:5173/'
else
  (cd dashboard && exec npm run dev -- --host 127.0.0.1 --strictPort) &
  frontend_pid=$!
  printf '%s\n' 'Abre http://127.0.0.1:5173/'
fi
if [ -n "$frontend_pid" ]; then
  printf '%s\n' 'Deja esta terminal abierta; Ctrl+C detiene los servicios iniciados aquí.'
  wait "$frontend_pid"
elif [ -n "$backend_pid" ]; then
  printf '%s\n' 'Deja esta terminal abierta; Ctrl+C detiene el backend iniciado aquí.'
  wait "$backend_pid"
fi
