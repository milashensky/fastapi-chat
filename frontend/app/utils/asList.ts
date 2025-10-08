import { excludeNullish } from "~/utils/excludeNullish";

export const asList = <T>(values: Record<string | number, T | null | undefined>): T[] => Object.values(values).filter(excludeNullish)
