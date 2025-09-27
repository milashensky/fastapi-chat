#!/usr/bin/env python
import os
import logging
import unittest
from sqlalchemy.exc import ProgrammingError, OperationalError
from db import get_db_connection_dsn
from sqlalchemy_utils.functions import create_database, drop_database

logger = logging.getLogger(__file__)

os.environ['FASTAPI_SETTINGS_MODULE'] = 'test_settings'

from conf import get_settings  # noqa: E402

settings = get_settings()


def drop_test_db():
    logger.info(f'dropping test db: : {settings.db_name}')
    try:
        drop_database(get_db_connection_dsn())
    except ProgrammingError:
        logger.error('Could not drop the database, probably does not exist.')
    except OperationalError:
        logger.error("Could not drop database because it's being accessed by other users.")

def run_migrations():
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config()
    alembic_cfg.set_main_option('script_location', str(settings.base_dir / 'migrations'))
    command.upgrade(alembic_cfg, "head")


def create_test_db():
    drop_test_db()
    logger.info(f'creating test db: {settings.db_name}')
    create_database(get_db_connection_dsn())
    run_migrations()



def run_tests():
    loader = unittest.TestLoader()
    suite = loader.discover(settings.base_dir)
    runner = unittest.TextTestRunner()
    create_test_db()
    runner.run(suite)


if __name__ == '__main__':
    run_tests()
