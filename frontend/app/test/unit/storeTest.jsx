import { render as defaultRender } from '@testing-library/react'
import { describeComponent } from './componentTest.jsx'
import CreateStoreStub from './createStoreStub.jsx'

export const createStore = (storeConstructor, render = defaultRender) => {
    render(
        <CreateStoreStub
            storeConstructor={storeConstructor}
        />
    )
    return storeConstructor.getState()
}

// export const describeStore = baseTest.extend({
//     createStore: async ({}, use) => {
//         await use(createStore)
//     },
// })

export const describeStore = (testName, callback) => describeComponent(testName, ({ render }) => {
    callback({
        createStore: (store) => createStore(store, render),
    })
})
