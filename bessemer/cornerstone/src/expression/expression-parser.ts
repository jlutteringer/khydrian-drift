import { Expression, ExpressionDefinition } from '@bessemer/cornerstone/expression'
import { Dictionary } from '@bessemer/cornerstone/types'
import { isExpression } from '@bessemer/cornerstone/expression/internal'
import { ValueExpression } from '@bessemer/cornerstone/expression/expression'
import { Preconditions } from '@bessemer/cornerstone'

type ExpressionResolver<ExpressionType, MappingType, ContextType> = (
  expression: ExpressionType,
  map: (expression: Expression<unknown>) => MappingType,
  context: ContextType
) => MappingType

export class ExpressionMapper<MappingType, ContextType> {
  private readonly resolverMap: Dictionary<ExpressionResolver<any, MappingType, ContextType>> = {}

  map(expression: Expression<unknown>, context: ContextType): MappingType {
    let expressionKey: string
    if (isExpression(expression)) {
      expressionKey = expression.expressionKey
    } else {
      expressionKey = ValueExpression.expressionKey
    }

    const resolver = this.resolverMap[expressionKey]
    Preconditions.isPresent(
      resolver,
      `Illegal Argument - Attempted to map unknown expression: ${expressionKey}. You must register(...) a handler for this expression type.`
    )

    return resolver(expression, (expression) => this.map(expression, context), context)
  }

  register<ExpressionType>(
    definition: ExpressionDefinition<any, any, ExpressionType>,
    resolver: ExpressionResolver<ExpressionType, MappingType, ContextType>
  ): void {
    this.resolverMap[definition.expressionKey] = resolver
  }
}
