import { EvaluateExpression, Expression, ExpressionContext, ExpressionDefinition, ExpressionKey, IExpression } from '@simulacrum/util/expression/index'
import { Objects } from '@simulacrum/util'

export const defineExpression = <ReturnType, ArgumentType extends Array<unknown>, PayloadType extends Record<string, unknown>>(options: {
  expressionKey: ExpressionKey<ReturnType, ArgumentType>
  builder: (...parameters: ArgumentType) => PayloadType
  resolver: (expression: PayloadType, evaluate: EvaluateExpression, context: ExpressionContext) => ReturnType
}): ExpressionDefinition<ReturnType, ArgumentType, Expression<ReturnType> & PayloadType> => {
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

export const isType = <ReturnValue, ArgumentType extends Array<any>, ExpressionType extends Expression<ReturnValue>>(
  expression: Expression<ReturnValue>,
  expressionDefinition: ExpressionDefinition<ReturnValue, ArgumentType, ExpressionType>
): expression is ReturnType<typeof expressionDefinition['builder']> => {
  if (!isExpression(expression)) {
    return false
  }

  return expression.expressionKey === expressionDefinition.expressionKey
}

export const isExpression = <T>(expression: Expression<any>): expression is IExpression<T> => {
  return Objects.isObject(expression) && 'expressionKey' in expression
}
