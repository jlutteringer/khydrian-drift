import pino from 'pino'
import { Arrays, Functions, Lazy, Objects } from '@bessemer/cornerstone'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'
import { LazyValue } from '@bessemer/cornerstone/lazy'
import { GenericRecord } from '@bessemer/cornerstone/types'

export type LoggerOptions = pino.LoggerOptions

type LogFunction = (message: LazyValue<string>, context?: GenericRecord) => void

export class Logger {
  constructor(private readonly logger: pino.Logger) {}

  trace: LogFunction = (message: LazyValue<string>, context?: GenericRecord): void => {
    if (this.logger.isLevelEnabled?.('trace') ?? true) {
      if (Objects.isPresent(context)) {
        this.logger.trace(context, Lazy.evaluate(message))
      } else {
        this.logger.trace(Lazy.evaluate(message))
      }
    }
  }

  debug: LogFunction = (message: LazyValue<string>, context?: GenericRecord): void => {
    if (this.logger.isLevelEnabled?.('debug') ?? true) {
      if (Objects.isPresent(context)) {
        this.logger.debug(context, Lazy.evaluate(message))
      } else {
        this.logger.debug(Lazy.evaluate(message))
      }
    }
  }

  info: LogFunction = (message: LazyValue<string>, context?: GenericRecord): void => {
    if (this.logger.isLevelEnabled?.('info') ?? true) {
      if (Objects.isPresent(context)) {
        this.logger.info(context, Lazy.evaluate(message))
      } else {
        this.logger.info(Lazy.evaluate(message))
      }
    }
  }

  warn: LogFunction = (message: LazyValue<string>, context?: GenericRecord): void => {
    if (this.logger.isLevelEnabled?.('warn') ?? true) {
      if (Objects.isPresent(context)) {
        this.logger.warn(context, Lazy.evaluate(message))
      } else {
        this.logger.warn(Lazy.evaluate(message))
      }
    }
  }

  error: LogFunction = (message: LazyValue<string>, context?: GenericRecord): void => {
    if (this.logger.isLevelEnabled?.('error') ?? true) {
      if (Objects.isPresent(context)) {
        this.logger.error(context, Lazy.evaluate(message))
      } else {
        this.logger.error(Lazy.evaluate(message))
      }
    }
  }

  fatal: LogFunction = (message: LazyValue<string>, context?: GenericRecord): void => {
    if (this.logger.isLevelEnabled?.('fatal') ?? true) {
      if (Objects.isPresent(context)) {
        this.logger.fatal(context, Lazy.evaluate(message))
      } else {
        this.logger.fatal(Lazy.evaluate(message))
      }
    }
  }

  private augmentLogArguments = (args: [unknown, any?, ...any]): [unknown, any?, ...any] => {
    if (!Functions.isFunction(args[0])) {
      return args
    }

    return [args[0](), ...Arrays.rest(args)]
  }
}

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

const createProxyHandler = (getLogger: () => pino.Logger): ProxyHandler<pino.Logger> => {
  let cachedLogger: pino.Logger | null = null
  let cachedVersion = GlobalLoggerState.getValue().version

  const getOrCreateLogger = () => {
    if (cachedVersion !== GlobalLoggerState.getValue().version) {
      cachedLogger = null
      cachedVersion = GlobalLoggerState.getValue().version
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

const GlobalLoggerState = createGlobalVariable<{
  version: number
  logger: pino.Logger
}>('GlobalLoggerState', () => ({
  version: 0,
  logger: pino(applyDefaultOptions({ level: 'info' })),
}))

const LoggerProxy: pino.Logger = new Proxy(
  {} as pino.Logger,
  createProxyHandler(() => GlobalLoggerState.getValue().logger)
)

const Primary: Logger = new Logger(LoggerProxy)

export const configure = (initialOptions?: LoggerOptions): void => {
  const options = applyDefaultOptions(initialOptions)
  GlobalLoggerState.setValue({ version: GlobalLoggerState.getValue().version++, logger: pino(options) })
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
