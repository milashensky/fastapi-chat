import { fireEvent, act } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import { useStateRef } from '../stateRef'


describeComponent('stateRef', ({ render }) => {
    it('should update component on value change', () => {
        const StubComponent = () => {
            const state = useStateRef(0)
            return (
                <button onClick={() => state.current += 1}>
                    state: { state.current }
                </button>
            )
        }
        const component = render(<StubComponent />)
        const button = component.getByText('state: 0')
        expect(button).toBeInTheDocument()
        act(() => {
            fireEvent.click(button)
        })
        expect(component.getByText('state: 1')).toBeInTheDocument()
    })

    it('should work well with nested object assignment', () => {
        const StubComponent = () => {
            const state = useStateRef({
                prop1: {
                    prop2: 0,
                },
            })
            const getDisplayValue = (item) => item.prop1.prop2
            return (
                <button onClick={() => state.current.prop1.prop2 += 1}>
                    state: { getDisplayValue(state.current) }
                </button>
            )
        }
        const component = render(<StubComponent />)
        const button = component.getByRole('button')
        expect(button.textContent).toContain('0')
        act(() => {
            fireEvent.click(button)
        })
        expect(button.textContent).toContain('1')
    })

    it('should support nested null change', () => {
        const StubComponent = () => {
            const state = useStateRef({
                prop1: null,
            })
            const getDisplayValue = (item) => JSON.stringify(item.prop1)
            const toggleNested = () => {
                if (state.current.prop1) {
                    state.current.prop1 = null
                    return
                }
                state.current.prop1 = { nested: 1 }
            }
            return (
                <button onClick={toggleNested}>
                    state: { getDisplayValue(state.current) }
                </button>
            )
        }
        const component = render(<StubComponent />)
        const button = component.getByRole('button')
        expect(button.textContent).toContain('null')
        act(() => {
            fireEvent.click(button)
        })
        expect(button.textContent).toContain('1')
        expect(button.textContent).not.toContain('null')
        act(() => {
            fireEvent.click(button)
        })
        expect(button.textContent).not.toContain('1')
        expect(button.textContent).toContain('null')
    })
})
