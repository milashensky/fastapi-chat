A basic chat build with FastAPI

## Install

### Backend
in `/api/`

* run `pip install -Ur requirements/base.txt`
* copy `.env.example` as `.env` and populate variables
* run migrations `alembic upgrade head`

## Dev server

### Backend
in `/api/`

* run `fastapi dev ./main.py`


## Test

### Backend
in `/api/`

* run `./test.py`