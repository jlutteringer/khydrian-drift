import { Objects } from '@khydrian-drift/util/index'

export type Signable = number | string | { id: string }

export const sign = (value: Signable): string | number => {
  if (Objects.isObject(value)) {
    return value.id
  }

  return value
}
