import { isFunction } from '@bessemer/cornerstone/function'

export const extend = <Target extends object, E extends Record<string, unknown>>(target: Target, extensions: E): Target & E => {
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (prop in extensions) {
        return extensions[prop as string]
      }

      const value = Reflect.get(target, prop, receiver)
      if (isFunction(value)) {
        return value.bind(target)
      }

      return value
    },
  }) as Target & E
}
