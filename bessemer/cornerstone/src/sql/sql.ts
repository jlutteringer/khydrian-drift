import { Expression, Expressions } from '@bessemer/cornerstone/expression'
import { DefaultSqlExpressionParser, SqlExpressionParser, SqlExpressionParserContext } from '@bessemer/cornerstone/sql/sql-expression-parser'
import { Dictionary } from '@bessemer/cornerstone/types'
import { SqlFragment, SqlParameterMap } from '@bessemer/cornerstone/sql'

export const fragment = (fragment: string): SqlFragment => {
  return fragment
}

export const parseExpression = (
  expression: Expression<unknown>,
  variableMap?: Dictionary<string>,
  parser: SqlExpressionParser = DefaultSqlExpressionParser
): [SqlFragment, SqlParameterMap] => {
  const context: SqlExpressionParserContext = {
    variables: variableMap ?? {},
    parameters: {},
  }
  const fragment = Expressions.map(expression, parser, context)
  return [fragment, context.parameters]
}
