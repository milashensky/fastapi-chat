import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { vi, afterEach } from 'vitest'
import { MockWebSocket } from '~/websocket/__mocks__/websocket'


vi.stubGlobal('WebSocket', MockWebSocket)

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    MockWebSocket.reset()
})

// Mock window.matchMedia for required components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})
