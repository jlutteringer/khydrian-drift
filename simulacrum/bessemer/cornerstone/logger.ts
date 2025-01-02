import pino from 'pino'
import { Objects } from '@bessemer/cornerstone/index'

export type LoggerOptions = pino.LoggerOptions

const getPrettyTransport = (): LoggerOptions => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    return {}
  }

  return {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname,module',
        messageFormat: '{if module}{module} - {end}{msg}',
      },
    },
  }
}

const applyDefaultOptions = (options?: LoggerOptions): LoggerOptions => {
  const defaultOptions: LoggerOptions = {
    browser: {
      asObject: true,
    },
    ...getPrettyTransport(),
  }

  return Objects.merge(defaultOptions, options)
}

let globalLoggerVersion = 0
let GlobalLogger: pino.Logger = pino(applyDefaultOptions({ level: 'info' }))

export const initialize = (options?: LoggerOptions): void => {
  GlobalLogger = pino(applyDefaultOptions(options))
  globalLoggerVersion++
}

const createProxyHandler = (getLogger: () => pino.Logger): ProxyHandler<pino.Logger> => {
  let cachedLogger: pino.Logger | null = null
  let cachedVersion = globalLoggerVersion

  const getOrCreateLogger = () => {
    if (cachedVersion !== globalLoggerVersion) {
      cachedLogger = null
      cachedVersion = globalLoggerVersion
    }

    if (!cachedLogger) {
      cachedLogger = getLogger()
    }

    return cachedLogger
  }

  return {
    get(_: any, prop: string): any {
      if (prop === 'child') {
        return (bindings: pino.Bindings) => {
          return new Proxy(
            {} as pino.Logger,
            createProxyHandler(() => getOrCreateLogger().child(bindings))
          )
        }
      }

      return (getOrCreateLogger() as any)[prop]
    },
  }
}

export const Primary: pino.Logger = new Proxy(
  {} as pino.Logger,
  createProxyHandler(() => GlobalLogger)
)

export const trace = (...args: Parameters<typeof Primary.trace>) => Primary.trace(...args)
export const debug = (...args: Parameters<typeof Primary.debug>) => Primary.debug(...args)
export const info = (...args: Parameters<typeof Primary.info>) => Primary.info(...args)
export const warn = (...args: Parameters<typeof Primary.warn>) => Primary.warn(...args)
export const error = (...args: Parameters<typeof Primary.error>) => Primary.error(...args)
export const fatal = (...args: Parameters<typeof Primary.fatal>) => Primary.fatal(...args)
