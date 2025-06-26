import { Expression, ExpressionContext, ExpressionDefinition, ExpressionReference } from '@bessemer/cornerstone/expression'
import { Assertions } from '@bessemer/cornerstone'
import { isRawValue } from '@bessemer/cornerstone/expression/internal'

// JOHN need to add tests...
export class ExpressionEvaluator {
  constructor(private readonly expressionDefinitions: Array<ExpressionDefinition<unknown, Array<any>, Expression<any>>>) {}

  evaluate<T>(expression: Expression<T>, context: ExpressionContext): T {
    if (isRawValue(expression)) {
      return expression
    }

    const matchingExpressionDefinition = this.expressionDefinitions.find((it) => it.expressionKey === expression.expressionKey)
    Assertions.assertPresent(matchingExpressionDefinition)
    return matchingExpressionDefinition.resolver(expression, (expression) => this.evaluate(expression, context), context) as T
  }

  dereference<ReturnType, ArgumentType extends Array<unknown>>(
    reference: ExpressionReference<ReturnType, ArgumentType>,
    ...args: ArgumentType
  ): Expression<ReturnType> {
    const matchingExpressionDefinition = this.expressionDefinitions.find((it) => it.expressionKey === reference.expressionKey)
    Assertions.assertPresent(matchingExpressionDefinition, () => `Unable to find Expression Definition for type: ${reference.expressionKey}`)
    return matchingExpressionDefinition.builder(...args)
  }
}
