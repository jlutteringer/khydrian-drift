import { GenericRecord } from '@bessemer/cornerstone/types'
import { evaluate, LazyValue } from '@bessemer/cornerstone/lazy'
import { isUndefined } from '@bessemer/cornerstone/object'

export type GlobalVariable<T> = {
  getValue: () => T
  setValue: (value: T) => void
}

let Global: { BessemerGlobalVariables: GenericRecord }
if(typeof window !== 'undefined') {
  Global = window as any
}
else if(typeof global !== 'undefined'){
  Global = global as any
}
else {
  Global = globalThis as any
}

if (isUndefined(Global.BessemerGlobalVariables)) {
  Global.BessemerGlobalVariables = {}
}

export const createGlobalVariable = <T>(key: string, defaultValue: LazyValue<T>): GlobalVariable<T> => {
  return {
    getValue: () => {
      const value = Global.BessemerGlobalVariables[key] as T | undefined

      if (isUndefined(value)) {
        const def = evaluate(defaultValue)
        Global.BessemerGlobalVariables[key] = def
        return def
      }

      return value
    },
    setValue: (value: T) => {
      Global.BessemerGlobalVariables[key] = value
    },
  }
}
