import pino from 'pino'
import { Arrays, Functions, Objects } from '@bessemer/cornerstone'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'

export type LoggerOptions = pino.LoggerOptions

// JOHN we might want to tweak this interface...
interface LogFunction {
  (obj: unknown, msg?: string, ...args: any[]): void
  (msg: string, ...args: any[]): void
}

export class Logger {
  constructor(private readonly logger: pino.Logger) {}

  trace: LogFunction = (...args): void => {
    if (this.logger.isLevelEnabled?.('trace') ?? true) {
      this.logger.trace(...this.augmentLogArguments(args))
    }
  }

  debug: LogFunction = (...args): void => {
    if (this.logger.isLevelEnabled?.('debug') ?? true) {
      this.logger.debug(...this.augmentLogArguments(args))
    }
  }

  info: LogFunction = (...args): void => {
    if (this.logger.isLevelEnabled?.('info') ?? true) {
      this.logger.info(...this.augmentLogArguments(args))
    }
  }

  warn: LogFunction = (...args): void => {
    if (this.logger.isLevelEnabled?.('warn') ?? true) {
      this.logger.warn(...this.augmentLogArguments(args))
    }
  }

  error: LogFunction = (...args): void => {
    if (this.logger.isLevelEnabled?.('error') ?? true) {
      this.logger.error(...this.augmentLogArguments(args))
    }
  }

  fatal: LogFunction = (...args): void => {
    if (this.logger.isLevelEnabled?.('fatal') ?? true) {
      this.logger.fatal(...this.augmentLogArguments(args))
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
