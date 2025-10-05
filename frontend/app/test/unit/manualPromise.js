export const manualPromise = () => {
    let manualResolve
    let manualReject
    const mock = vi.fn(() => new Promise((resolve, reject) => {
        manualResolve = resolve
        manualReject = reject
    }))
    mock.resolve = (value) => manualResolve(value)
    mock.reject = (value) => manualReject(value)
    return mock
}
