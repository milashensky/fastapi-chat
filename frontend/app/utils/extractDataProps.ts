import type { GenericProps } from "~/globals/types"

export const extractDataProps = <T extends GenericProps>(props: T): GenericProps => {
    const dataProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => key.startsWith('data-'))
    )
    return dataProps
}
