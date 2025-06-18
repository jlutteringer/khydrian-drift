import { ExpressionMapper } from '@bessemer/cornerstone/expression/expression-mapper'
import { Arrays, Entries, Objects, Ulids } from '@bessemer/cornerstone'
import { BasicType, Dictionary } from '@bessemer/cornerstone/types'
import {
  AndExpression,
  ContainsExpression,
  EqualsExpression,
  GreaterThanExpression,
  GreaterThanOrEqualExpression,
  LessThanExpression,
  LessThanOrEqualExpression,
  NotExpression,
  OrExpression,
  ValueExpression,
  VariableExpression,
} from '@bessemer/cornerstone/expression/core-expression'
import { isType, isValue } from '@bessemer/cornerstone/expression/internal'
import { SqlFragment, SqlParameterMap } from '@bessemer/cornerstone/sql'

export type SqlExpressionParserContext = {
  variables: Dictionary<string>
  parameters: SqlParameterMap
}
export class SqlExpressionParser extends ExpressionMapper<SqlFragment, SqlExpressionParserContext> {}

export const DefaultSqlExpressionParser = new SqlExpressionParser()
DefaultSqlExpressionParser.register(ValueExpression, (expression, _, context) => {
  const value = expression.value
  const parameterName = `_${Ulids.generate()}`
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
    // JOHN tons of gross duplicated code that is duped across the contains resolver
    const collection = expression.value.collection

    // JOHN parsing expressions like this should be easier...
    let value: Array<BasicType> = []
    if (isType(collection, ValueExpression)) {
      value = collection.value as Array<BasicType>
    } else if (isValue(collection)) {
      value = collection as Array<BasicType>
    } else {
      throw new Error(`SqlExpressionParser - Unable to resolve ContainsExpression with non-value collection: ${JSON.stringify(collection)}`)
    }

    value.forEach((it) => {
      if (!Objects.isBasic(it)) {
        throw new Error(`SqlExpressionParser - Unable to resolve complex ValueExpression as Sql: ${JSON.stringify(it)}`)
      }
    })

    const parameters = value.map((it) => Entries.of(`_${Ulids.generate()}`, it))
    parameters.forEach(([key, value]) => {
      context.parameters[key] = value
    })

    const containsExpression = expression.value.operands
      .map(map)
      .map(
        (sql) =>
          `(${sql} NOT IN (${Entries.keys(parameters)
            .map((it) => `:${it}`)
            .join(',')}))`
      )
      .join(' AND ')

    return `(${containsExpression})`
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
  const equalsExpressions = rest.map((it) => `(${mappedFirst} = ${map(it)})`).join(' AND ')
  return `(${equalsExpressions})`
})
DefaultSqlExpressionParser.register(ContainsExpression, (expression, map, context) => {
  const collection = expression.collection

  // JOHN parsing expressions like this should be easier...
  let value: Array<BasicType> = []
  if (isType(collection, ValueExpression)) {
    value = collection.value as Array<BasicType>
  } else if (isValue(collection)) {
    value = collection as Array<BasicType>
  } else {
    throw new Error(`SqlExpressionParser - Unable to resolve ContainsExpression with non-value collection: ${JSON.stringify(collection)}`)
  }

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
})
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
