import { act } from '@testing-library/react'
import type * as ZustandExportedTypes from 'zustand'
import { vi, afterEach } from 'vitest'
export * from 'zustand'

const { create: actualCreate, createStore: actualCreateStore } =
    await vi.importActual<typeof ZustandExportedTypes>('zustand')

// a variable to hold reset functions for all stores declared in the app
export const storeResetFns = new Set<() => void>()

// mocks methods, so all data actions are stubbed by default
const getMockState = <T>(initialState: T) => {
    if (typeof initialState !== 'object') {
        return initialState
    }
    const withMocks = Object.entries(initialState as object).map(([key, value]) => {
        if (typeof value === 'function') {
            return [key, vi.fn()]
        }
        return [key, value]
    })
    return Object.fromEntries(withMocks)
}

const createUncurried = <T>(
    stateCreator: ZustandExportedTypes.StateCreator<T>,
) => {
    const store = actualCreate(stateCreator)
    const initialState = store.getInitialState()
    storeResetFns.add(() => {
        store.setState(getMockState(initialState), true)
    })
    store.setState(getMockState(initialState))
    return store
}

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = (<T>(
    stateCreator: ZustandExportedTypes.StateCreator<T>,
) => {
    // to support curried version of create
    return typeof stateCreator === 'function'
        ? createUncurried(stateCreator)
        : createUncurried
}) as typeof ZustandExportedTypes.create

const createStoreUncurried = <T>(
    stateCreator: ZustandExportedTypes.StateCreator<T>,
) => {
    const store = actualCreateStore(stateCreator)
    const initialState = store.getInitialState()
    storeResetFns.add(() => {
        store.setState(getMockState(initialState), true)
    })
    store.setState(getMockState(initialState))
    return store
}

// when creating a store, we get its initial state, create a reset function and add it in the set
export const createStore = (<T>(
    stateCreator: ZustandExportedTypes.StateCreator<T>,
) => {
    // to support curried version of createStore
    return typeof stateCreator === 'function'
        ? createStoreUncurried(stateCreator)
        : createStoreUncurried
}) as typeof ZustandExportedTypes.createStore

// reset all stores after each test run
afterEach(() => {
    act(() => {
        storeResetFns.forEach((resetFn) => {
            resetFn()
        })
    })
})
