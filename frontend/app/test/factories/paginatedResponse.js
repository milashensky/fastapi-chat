export const paginatedResponseFactory = (overrides = {}) => ({
    'total': 1,
    'page': 1,
    'page_size': 25,
    'next': null,
    'results': [],
    ...overrides,
})
