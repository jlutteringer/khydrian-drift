import { Expression, ExpressionContext, ExpressionDefinition, ExpressionReference, IExpression } from '@simulacrum/util/expression'
import { Objects, Preconditions } from '@simulacrum/util'

export class ExpressionEvaluator {
  constructor(private readonly expressionDefinitions: Array<ExpressionDefinition<unknown, Array<any>, Expression<any>>>) {}

  evaluate<T>(expression: Expression<T>, context: ExpressionContext): T {
    if (isValue(expression)) {
      return expression
    }

    const matchingExpressionDefinition = this.expressionDefinitions.find((it) => it.expressionKey === expression.expressionKey)
    Preconditions.isPresent(matchingExpressionDefinition)
    return matchingExpressionDefinition.resolver(expression, (expression) => this.evaluate(expression, context), context) as T
  }

  dereference<ReturnType, ArgumentType extends Array<unknown>>(
    reference: ExpressionReference<ReturnType, ArgumentType>,
    ...args: ArgumentType
  ): Expression<ReturnType> {
    const matchingExpressionDefinition = this.expressionDefinitions.find((it) => it.expressionKey === reference.expressionKey)
    Preconditions.isPresent(matchingExpressionDefinition, () => `Unable to find Expression Definition for type: ${reference.expressionKey}`)
    return matchingExpressionDefinition.builder(...args)
  }
}

const isValue = <T>(expression: Expression<T>): expression is T => {
  if (!Objects.isObject(expression)) {
    return true
  }

  const result = (expression as IExpression<T>).expressionKey === undefined
  return result
}
