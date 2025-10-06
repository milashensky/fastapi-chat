import {
    createContext,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
} from "react"
import { useStateRef } from "~/utils/stateRef"

export type Validator = () => boolean

export interface FormRef {
    validate: Validator
}

interface Props {
    onSubmit?: () => void
    children: React.ReactNode
    className?: string
    ref?: React.Ref<FormRef>
}

export interface FormContextType {
    validate: Validator
    registerValidator: (validator: Validator) => void
    unregisterValidator: (validator: Validator) => void
}

export const FormContext = createContext<FormContextType>({
    validate: () => true,
    registerValidator: () => {},
    unregisterValidator: () => {},
})

export type FieldValidator<T> = (value?: T) => true | string

interface ValidatorOptions<T>{
    value?: T
    rules?: FieldValidator<T>[]
}

export const useFormValidator = <T,>(options: ValidatorOptions<T>) => {
    const formContext = useContext(FormContext)
    const errors = useStateRef<string[]>([])
    const validateField = () => {
        if (!options.rules?.length) {
            return true
        }
        const results = options.rules.map((rule) => rule(options.value))
        const errorMessages = results.filter((result) => result !== true)
        errors.current = errorMessages
        return errorMessages.length === 0
    }
    useEffect(() => {
        formContext.registerValidator(validateField)
        return () => formContext.unregisterValidator(validateField)
    }, [validateField, formContext.registerValidator, formContext.unregisterValidator]);
    return {
        errors,
        validateField,
    }
}

export default (props: Props) => {
    const registeredValidators = useRef<Set<Validator>>(new Set())
    const validate = () => {
        if (!registeredValidators.current.size) {
            return true
        }
        const isValidResults = [...registeredValidators.current].map((validator) => validator())
        return isValidResults.every(Boolean)
    }
    useImperativeHandle(props.ref, () => ({
        validate,
    }), [props.ref]);
    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (props.onSubmit) {
            return props.onSubmit()
        }
    }
    const context = {
        validate,
        registerValidator: (addedValidator: Validator) => {
            registeredValidators.current.add(addedValidator)
        },
        unregisterValidator: (removedValidator: Validator) => {
            registeredValidators.current.delete(removedValidator)
        },
    }
    return (
        <form
            className={props.className}
            onSubmit={handleSubmit}
        >
            <FormContext.Provider
                value={context}
            >
                {props.children}
            </FormContext.Provider>
        </form>
    )
}
