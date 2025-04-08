import pino from 'pino'
import { Lazy, Objects } from '@bessemer/cornerstone'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'
import { LazyValue } from '@bessemer/cornerstone/lazy'
import { UnknownRecord } from 'type-fest'

type PinoLogger = pino.Logger
type PinoBindings = pino.Bindings
export type LoggerOptions = pino.LoggerOptions

type LogOptions = { error?: unknown; context?: UnknownRecord }
type LogFunction = (message: LazyValue<string>, options?: LogOptions) => void

export class Logger {
  constructor(private readonly logger: PinoLogger) {}

  trace: LogFunction = (message: LazyValue<string>, options?: LogOptions): void => {
    if (this.logger.isLevelEnabled?.('trace') ?? true) {
      this.logger.trace({ err: options?.error, context: options?.context }, Lazy.evaluate(message))
    }
  }

  debug: LogFunction = (message: LazyValue<string>, options?: LogOptions): void => {
    if (this.logger.isLevelEnabled?.('debug') ?? true) {
      this.logger.debug({ err: options?.error, context: options?.context }, Lazy.evaluate(message))
    }
  }

  info: LogFunction = (message: LazyValue<string>, options?: LogOptions): void => {
    if (this.logger.isLevelEnabled?.('info') ?? true) {
      this.logger.info({ err: options?.error, context: options?.context }, Lazy.evaluate(message))
    }
  }

  warn: LogFunction = (message: LazyValue<string>, options?: LogOptions): void => {
    if (this.logger.isLevelEnabled?.('warn') ?? true) {
      this.logger.warn({ err: options?.error, context: options?.context }, Lazy.evaluate(message))
    }
  }

  error: LogFunction = (message: LazyValue<string>, options?: LogOptions): void => {
    if (this.logger.isLevelEnabled?.('error') ?? true) {
      this.logger.error({ err: options?.error, context: options?.context }, Lazy.evaluate(message))
    }
  }

  fatal: LogFunction = (message: LazyValue<string>, options?: LogOptions): void => {
    if (this.logger.isLevelEnabled?.('fatal') ?? true) {
      this.logger.fatal({ err: options?.error, context: options?.context }, Lazy.evaluate(message))
    }
  }
}

const getPrettyTransport = (): LoggerOptions => {
  if (process.env.NODE_ENV === 'production' || typeof window !== 'undefined') {
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
    // JOHN need to find a better way to include
    // ...getPrettyTransport(),
  }

  return Objects.merge(defaultOptions, options)
}

const createProxyHandler = (getLogger: () => PinoLogger): ProxyHandler<PinoLogger> => {
  let cachedLogger: PinoLogger | null = null
  let cachedVersion = GlobalLoggerState.getValue().version

  const getOrCreateLogger = () => {
    if (cachedVersion !== GlobalLoggerState.getValue().version) {
      cachedLogger = null
      cachedVersion = GlobalLoggerState.getValue().version
    }

    if (Objects.isNil(cachedLogger)) {
      cachedLogger = getLogger()
    }

    return cachedLogger
  }

  return {
    get(_: any, prop: string): any {
      if (prop === 'child') {
        return (bindings: PinoBindings) => {
          return new Proxy(
            {} as PinoLogger,
            createProxyHandler(() => getOrCreateLogger().child(bindings))
          )
        }
      }

      return (getOrCreateLogger() as any)[prop]
    },
  }
}

const GlobalLoggerState = createGlobalVariable<{
  version: number
  logger: pino.Logger
}>('GlobalLoggerState', () => ({
  version: 0,
  logger: pino(applyDefaultOptions({ level: 'info' })),
}))

const LoggerProxy: PinoLogger = new Proxy(
  {} as PinoLogger,
  createProxyHandler(() => GlobalLoggerState.getValue().logger)
)

const Primary: Logger = new Logger(LoggerProxy)

export const initialize = (initialOptions?: LoggerOptions): void => {
  const options = applyDefaultOptions(initialOptions)
  GlobalLoggerState.setValue({ version: GlobalLoggerState.getValue().version + 1, logger: pino(options) })
}

export const child = (module: string): Logger => {
  return new Logger(LoggerProxy.child({ module }))
}

export const trace = Primary.trace
export const debug = Primary.debug
export const info = Primary.info
export const warn = Primary.warn
export const error = Primary.error
export const fatal = Primary.fatal
