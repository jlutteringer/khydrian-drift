import { Expression, ExpressionContext, ExpressionDefinition, ExpressionKey, IExpression } from '@simulacrum/util/expression/index'

export const defineExpression = <ReturnType, ArgumentType extends Array<unknown>, PayloadType extends Record<string, unknown>>(options: {
  expressionKey: ExpressionKey<ReturnType, ArgumentType>
  builder: (...parameters: ArgumentType) => PayloadType
  resolver: (expression: PayloadType, evaluate: <T>(expression: Expression<T>) => T, context: ExpressionContext) => ReturnType
}): ExpressionDefinition<ReturnType, ArgumentType, IExpression<ReturnType>> => {
  return {
    expressionKey: options.expressionKey,
    builder: (...parameters) => {
      return { expressionKey: options.expressionKey, ...options.builder(...parameters) }
    },
    resolver: (expression, evaluate, context) => {
      return options.resolver(expression as any, evaluate, context)
    },
  }
}
