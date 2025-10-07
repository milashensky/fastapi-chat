A basic chat build with FastAPI

## Install

### Backend
in `/api/`

* run `pip install -Ur requirements/base.txt`
* copy `.env.example` as `.env` and populate variables
* run migrations `alembic upgrade head`

### Frontend
in `/frontend/`

* run `npm i`

## Dev server

### Backend
in `/api/`

* run `fastapi dev ./main.py`

### Frontend
in `/frontend/`

* run `npm run dev`


## Test

### Backend
in `/api/`

* run `./test.py`


### Backend
in `/frontend/`

* run `npm run test`
* run `npm run typecheck`