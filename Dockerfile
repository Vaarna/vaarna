FROM node:15 as node

WORKDIR /app
COPY frontend /app/frontend
COPY Makefile /app

RUN make init-frontend build-frontend


FROM python:3.8-alpine as requirements

WORKDIR /app
COPY backend/pyproject.toml /app
COPY backend/poetry.lock /app

RUN apk add make curl \
&& curl -sSL https://raw.githubusercontent.com/sdispater/poetry/master/get-poetry.py | python \
&& $HOME/.poetry/bin/poetry export -f requirements.txt > requirements.txt


FROM python:3.8-alpine as python

WORKDIR /app
COPY --from=node /app/frontend/dist /app/frontend/dist
COPY backend /app/backend
COPY --from=requirements /app/requirements.txt /app/backend

WORKDIR /app/backend

RUN pip install -r requirements.txt

CMD python -m gm_screen start
