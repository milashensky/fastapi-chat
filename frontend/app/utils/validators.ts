export const requiredFieldValidator = <T>(value?: T): true | string => {
    if (Number.isFinite(value)) {
        return true
    }
    if (!value) {
        return 'This field is required.'
    }
    return true
}

export const getMinLengthValidator = (minLength: number) => (value?: string): true | string => {
    // field is not required to exist, it's a different validator
    if (!value) {
        return true
    }
    if (value.length < minLength) {
        return `Must be at least ${minLength} characters long.`
    }
    return true
}

export const passwordLengthValidator = getMinLengthValidator(6)

export const emailValidator = (value?: string): true | string => {
    if (!value) {
        return true
    }
    const isEmail = value.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    if (isEmail) {
        return true
    }
    return 'Invalid email address.'
}
