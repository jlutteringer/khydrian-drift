import { GenericRecord } from '@bessemer/cornerstone/types'
import { evaluate, LazyValue } from '@bessemer/cornerstone/lazy'
import { isUndefined } from '@bessemer/cornerstone/object'
import { NonUndefined } from 'react-hook-form'

export type GlobalVariable<T> = {
  getValue: () => T
  setValue: (value: T) => void
}

declare global {
  // noinspection ES6ConvertVarToLetConst,JSUnusedGlobalSymbols
  var BessemerGlobalVariables: GenericRecord
}

if (isUndefined(global.BessemerGlobalVariables)) {
  global.BessemerGlobalVariables = {}
}

export const createGlobalVariable = <T>(key: string, defaultValue: LazyValue<NonUndefined<T>>): GlobalVariable<T> => {
  return {
    getValue: () => {
      const value = global.BessemerGlobalVariables[key] as T | undefined

      if (isUndefined(value)) {
        const def = evaluate(defaultValue)
        global.BessemerGlobalVariables[key] = def
        return def
      }

      return value
    },
    setValue: (value: T) => {
      global.BessemerGlobalVariables[key] = value
    },
  }
}
