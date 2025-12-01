

export class MockWebSocket {
    static instances: MockWebSocket[] = []
    readyState: number = WebSocket.OPEN
    onopen: (() => void) | null = null
    onmessage: ((event: MessageEvent) => void) | null = null
    onclose: (() => void) | null = null
    onerror: ((event: Event) => void) | null = null
    sentMessages: string[] = []

    constructor(public url: string) {
        MockWebSocket.instances.push(this)
    }

    send(data: string) {
        this.sentMessages.push(data)
    }

    close() {
        this.readyState = WebSocket.CLOSED
        this.onclose?.()
    }

    simulateOpen() {
        this.onopen?.()
    }

    simulateMessage(data: object) {
        this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent)
    }

    simulateClose() {
        this.onclose?.()
    }

    simulateError() {
        this.onerror?.({ type: 'error' } as Event)
    }

    static reset() {
        MockWebSocket.instances = []
    }
}
