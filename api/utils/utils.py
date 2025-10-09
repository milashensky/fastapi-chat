from datetime import datetime, timezone


def get_utc_now():
    now = datetime.now(timezone.utc)
    return now
