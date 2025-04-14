import { Expression, ExpressionDefinition } from '@bessemer/cornerstone/expression'
import { Dictionary } from '@bessemer/cornerstone/types'
import { isExpression } from '@bessemer/cornerstone/expression/internal'
import { Preconditions } from '@bessemer/cornerstone'
import { value } from '@bessemer/cornerstone/expression/expression'
import { ValueExpression } from '@bessemer/cornerstone/expression/core-expression'

type ExpressionResolver<ExpressionType, MappingType, ContextType> = (
  expression: ExpressionType,
  map: (expression: Expression<unknown>) => MappingType,
  context: ContextType
) => MappingType

export class ExpressionMapper<MappingType, ContextType> {
  private readonly resolverMap: Dictionary<ExpressionResolver<any, MappingType, ContextType>> = {}

  map(expression: Expression<unknown>, context: ContextType): MappingType {
    if (isExpression(expression)) {
      const resolver = this.resolverMap[expression.expressionKey]
      Preconditions.isPresent(
        resolver,
        `Illegal Argument - Attempted to map unknown expression: ${expression.expressionKey}. You must register(...) a handler for this expression type.`
      )

      return resolver(expression, (expression) => this.map(expression, context), context)
    } else {
      const resolver = this.resolverMap[ValueExpression.expressionKey]
      Preconditions.isPresent(
        resolver,
        `Illegal Argument - Attempted to map unknown expression: ${ValueExpression.expressionKey}. You must register(...) a handler for this expression type.`
      )

      const valueExpression = value(expression)
      return resolver(valueExpression, (expression) => this.map(expression, context), context)
    }
  }

  register<ExpressionType>(
    definition: ExpressionDefinition<any, any, ExpressionType>,
    resolver: ExpressionResolver<ExpressionType, MappingType, ContextType>
  ): void {
    this.resolverMap[definition.expressionKey] = resolver
  }
}
