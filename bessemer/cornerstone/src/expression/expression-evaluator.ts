import { Expression, ExpressionContext, ExpressionDefinition, ExpressionReference } from '@bessemer/cornerstone/expression'
import { Preconditions } from '@bessemer/cornerstone'
import { isValue } from '@bessemer/cornerstone/expression/internal'

// JOHN need to add tests...
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
