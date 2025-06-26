import { ExpressionMapper, ExpressionResolver } from '@bessemer/cornerstone/expression/expression-mapper'
import { Arrays, Entries, Objects, Ulids } from '@bessemer/cornerstone'
import { BasicType, Dictionary } from '@bessemer/cornerstone/types'
import {
  AndExpression,
  ContainsExpression,
  EqualsExpression,
  getValue,
  GreaterThanExpression,
  GreaterThanOrEqualExpression,
  LessThanExpression,
  LessThanOrEqualExpression,
  NotExpression,
  OrExpression,
  ValueExpression,
  VariableExpression,
} from '@bessemer/cornerstone/expression/core-expression'
import { isType } from '@bessemer/cornerstone/expression/internal'
import { SqlFragment, SqlParameterMap } from '@bessemer/cornerstone/sql'

export type SqlExpressionParserContext = {
  variables: Dictionary<string>
  parameters: SqlParameterMap
}
export class SqlExpressionParser extends ExpressionMapper<SqlFragment, SqlExpressionParserContext> {}

// JOHN should be easier to define this type
const resolveContainsExpression: ExpressionResolver<ReturnType<typeof ContainsExpression.builder>, SqlFragment, SqlExpressionParserContext> = (
  expression,
  map,
  context
) => {
  const collection = expression.collection

  const parsedValue = getValue(collection)
  if (!parsedValue.isSuccess) {
    throw new Error(`SqlExpressionParser - Unable to resolve ContainsExpression with non-value collection: ${JSON.stringify(collection)}`)
  }
  const value = parsedValue.value as Array<BasicType>

  value.forEach((it) => {
    if (!Objects.isBasic(it)) {
      throw new Error(`SqlExpressionParser - Unable to resolve complex ValueExpression as Sql: ${JSON.stringify(it)}`)
    }
  })

  const parameters = value.map((it) => Entries.of(`_${Ulids.generate()}`, it))
  parameters.forEach(([key, value]) => {
    context.parameters[key] = value
  })

  const containsExpression = expression.operands
    .map(map)
    .map(
      (sql) =>
        `(${sql} IN (${Entries.keys(parameters)
          .map((it) => `:${it}`)
          .join(',')}))`
    )
    .join(' AND ')

  return `(${containsExpression})`
}

export const DefaultSqlExpressionParser = new SqlExpressionParser()
DefaultSqlExpressionParser.register(ValueExpression, (expression, _, context) => {
  const value = expression.value
  const parameterName = `_${Ulids.generate()}`
  if (value === null) {
    throw new Error(`SqlExpressionParser - Unable to resolve null ValueExpression as Sql`)
  }
  if (!Objects.isBasic(value)) {
    throw new Error(`SqlExpressionParser - Unable to resolve complex ValueExpression as Sql: ${JSON.stringify(value)}`)
  }

  context.parameters[parameterName] = value
  return `:${parameterName}`
})
DefaultSqlExpressionParser.register(VariableExpression, (expression, _, context) => {
  const variableName = context.variables[expression.name]
  return variableName ?? expression.name
})
DefaultSqlExpressionParser.register(NotExpression, (expression, map, context) => {
  if (isType(expression.value, ContainsExpression)) {
    return resolveContainsExpression(expression.value, map, context)
  } else {
    return `(NOT ${map(expression.value)})`
  }
})
DefaultSqlExpressionParser.register(AndExpression, (expression, map) => {
  return `(${expression.operands.map(map).join(' AND ')})`
})
DefaultSqlExpressionParser.register(OrExpression, (expression, map) => {
  return `(${expression.operands.map(map).join(' OR ')})`
})
DefaultSqlExpressionParser.register(EqualsExpression, (expression, map) => {
  const first = Arrays.first(expression.operands)!
  const rest = Arrays.rest(expression.operands)

  const mappedFirst = map(first)
  const equalsExpressions = rest
    .map((it) => {
      const parsedValue = getValue(it)
      if (parsedValue.isSuccess) {
        if (parsedValue.value === null) {
          return `(${mappedFirst} IS NULL)`
        } else {
          return `(${mappedFirst} = ${map(it)})`
        }
      } else {
        return `(${mappedFirst} = ${map(it)})`
      }
    })
    .join(' AND ')
  return `(${equalsExpressions})`
})
DefaultSqlExpressionParser.register(ContainsExpression, resolveContainsExpression)
DefaultSqlExpressionParser.register(LessThanExpression, (expression, map) => {
  return `(${map(expression.left)} < ${map(expression.right)})`
})
DefaultSqlExpressionParser.register(LessThanOrEqualExpression, (expression, map) => {
  return `(${map(expression.left)} <= ${map(expression.right)})`
})
DefaultSqlExpressionParser.register(GreaterThanExpression, (expression, map) => {
  return `(${map(expression.left)} > ${map(expression.right)})`
})
DefaultSqlExpressionParser.register(GreaterThanOrEqualExpression, (expression, map) => {
  return `(${map(expression.left)} >= ${map(expression.right)})`
})
