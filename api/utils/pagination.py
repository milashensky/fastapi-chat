from sqlmodel import Session, func, select


def pagination_dep(page: int | None = 1, page_size: int | None = 25):
    return {
        'page': page,
        'page_size': page_size,
    }


def paginate_response(
    query,
    pagination: dict,
    db_session: Session,
):
    next_page = None
    page = max(pagination.get('page', 1), 1)
    page_size = pagination.get('page_size', 25)
    total = db_session.exec(
        select(func.count()).select_from(query.subquery())
    ).one()
    offset = (page - 1) * page_size
    results = []
    if total:
        results = db_session.exec(
            query
            .offset(offset)
            .limit(page_size)
        ).scalars().all()
        has_next = (offset + page_size) < total
        if has_next:
            next_page = page + 1
    return {
        'total': total,
        'page': page,
        'page_size': page_size,
        'next': next_page,
        'results': results
    }
