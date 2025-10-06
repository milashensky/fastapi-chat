import { useRef } from 'react'
import { useStateRef } from '~/utils/stateRef'
import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from "~/test/unit/componentTest"
import Form, { useFormValidator } from '../form'

describeComponent('Form', ({ render }) => {
    const FormValidator = (props) => {
        const { errors } = useFormValidator(props)
        const getDisplayValue = (value) => JSON.stringify(value)
        return (
            <div>
                { getDisplayValue(errors.current) }
            </div>
        )
    }

    describe('validation', () => {
        const TestComponent = (props) => {
            const ref = useRef()
            const isValid = useStateRef(true)
            const validate = () => {
                isValid.current = ref.current.validate()
            }
            return (
                <Form ref={ref}>
                    <FormValidator
                        value={props.value1}
                        rules={props.rules1}
                    />
                    <FormValidator
                        value={props.value2}
                        rules={props.rules2}
                    />
                    <FormValidator
                        value={props.value3}
                        rules={props.rules3}
                    />
                    <button onClick={validate}>validate</button>
                    <div data-testid="validState">{isValid.current ? 'true' : 'false' }</div>
                </Form>
            )
        }

        it('should run validators on child forms and return true if all valid', () => {
            const rule1_1 = vi.fn().mockReturnValue(true)
            const rule1_2 = vi.fn().mockReturnValue(true)
            const rule2_1 = vi.fn().mockReturnValue(true)
            const rule2_2 = vi.fn().mockReturnValue(true)
            const rule3_1 = vi.fn().mockReturnValue(true)
            const rule3_2 = vi.fn().mockReturnValue(true)
            const props = {
                value1: 'a',
                rules1: [rule1_1, rule1_2],
                value2: 2,
                rules2: [rule2_1, rule2_2],
                value3: undefined,
                rules3: [rule3_1, rule3_2],
            }
            const component = render(<TestComponent {...props}/>)
            const button = component.getByRole('button')
            act(() => {
                fireEvent.click(button)
            })
            expect(component.getByTestId('validState').textContent).toBe('true')
            expect(rule1_1).toHaveBeenCalledWith(props.value1)
            expect(rule1_2).toHaveBeenCalledWith(props.value1)
            expect(rule2_1).toHaveBeenCalledWith(props.value2)
            expect(rule2_2).toHaveBeenCalledWith(props.value2)
            expect(rule3_1).toHaveBeenCalledWith(props.value3)
            expect(rule3_2).toHaveBeenCalledWith(props.value3)
        })

        it('should run validators on child forms and return false if at least 1 is not valid', () => {
            const rule1_1 = vi.fn().mockReturnValue(true)
            const rule1_2 = vi.fn().mockReturnValue(true)
            const rule2_1 = vi.fn().mockReturnValue(true)
            const rule2_2 = vi.fn().mockReturnValue('Invalid')
            const rule3_1 = vi.fn().mockReturnValue(true)
            const rule3_2 = vi.fn().mockReturnValue(true)
            const props = {
                value1: 'a',
                rules1: [rule1_1, rule1_2],
                value2: 2,
                rules2: [rule2_1, rule2_2],
                value3: undefined,
                rules3: [rule3_1, rule3_2],
            }
            const component = render(<TestComponent {...props}/>)
            const button = component.getByRole('button')
            act(() => {
                fireEvent.click(button)
            })
            expect(component.getByTestId('validState').textContent).toBe('false')
            expect(rule1_1).toHaveBeenCalledWith(props.value1)
            expect(rule1_2).toHaveBeenCalledWith(props.value1)
            expect(rule2_1).toHaveBeenCalledWith(props.value2)
            expect(rule2_2).toHaveBeenCalledWith(props.value2)
            expect(rule3_1).toHaveBeenCalledWith(props.value3)
            expect(rule3_2).toHaveBeenCalledWith(props.value3)
        })
    })

    describe('registration', () => {
        const TestComponent = (props) => {
            const ref = useRef()
            const isValid = useStateRef(true)
            const validate = () => {
                isValid.current = ref.current.validate()
            }
            return (
                <Form ref={ref}>
                    {
                        props.isRenderField1 &&
                        <FormValidator
                            value={props.value1}
                            rules={props.rules1}
                        />
                    }
                    {
                        props.isRenderField2 &&
                        <FormValidator
                            value={props.value2}
                            rules={props.rules2}
                        />
                    }
                    <button onClick={validate}>validate</button>
                </Form>
            )
        }

        const rule1 = vi.fn().mockReturnValue(true)
        const rule2 = vi.fn().mockReturnValue(true)

        it('should register field validators once field is rendered', () => {
            const props = {
                isRenderField1: true,
                value1: 'a',
                rules1: [rule1],
                isRenderField2: false,
                value2: 2,
                rules2: [rule2],
            }
            const component = render(<TestComponent {...props}/>)
            act(() => {
                fireEvent.click(component.getByRole('button'))
            })
            component.rerender(
                <TestComponent
                    {...props}
                    isRenderField2={true}
                />
            )
            act(() => {
                fireEvent.click(component.getByRole('button'))
            })
            expect(rule1).toHaveBeenCalledTimes(2)
            expect(rule2).toHaveBeenCalledTimes(1)
        })

        it('should forger field validators once field is removed', () => {
            const props = {
                isRenderField1: true,
                value1: 'a',
                rules1: [rule1],
                isRenderField2: true,
                value2: 2,
                rules2: [rule2],
            }
            const component = render(<TestComponent {...props}/>)
            act(() => {
                fireEvent.click(component.getByRole('button'))
            })
            component.rerender(
                <TestComponent
                    {...props}
                    isRenderField1={false}
                />
            )
            act(() => {
                fireEvent.click(component.getByRole('button'))
            })
            expect(rule1).toHaveBeenCalledTimes(1)
            expect(rule2).toHaveBeenCalledTimes(2)
        })
    })
})
