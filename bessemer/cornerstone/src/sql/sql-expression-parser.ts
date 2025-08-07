import { ExpressionMapper } from '@bessemer/cornerstone/expression/expression-mapper'
import { Arrays, Eithers, Entries, Objects, Ulids } from '@bessemer/cornerstone'
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
import { Expression } from '@bessemer/cornerstone/expression'

export type SqlExpressionParserContext = {
  variables: Dictionary<string>
  parameters: SqlParameterMap
}
export class SqlExpressionParser extends ExpressionMapper<SqlFragment, SqlExpressionParserContext> {}

const resolveContainsExpression = (
  // JOHN should be easier to define this type
  expression: ReturnType<typeof ContainsExpression.builder>,
  map: (expression: Expression<unknown>) => SqlFragment,
  context: SqlExpressionParserContext,
  invert = false
) => {
  const collection = expression.collection

  const parsedValue = getValue(collection)
  if (!parsedValue.isSuccess) {
    throw new Error(`SqlExpressionParser - Unable to resolve ContainsExpression with non-value collection: ${JSON.stringify(collection)}`)
  }
  const value = parsedValue.value as Array<BasicType | null>
  if (Arrays.isEmpty(value)) {
    return invert ? '(1 = 1)' : '(1 = 0)'
  }

  value.forEach((it) => {
    if (it !== null && !Objects.isBasic(it)) {
      throw new Error(`SqlExpressionParser - Unable to resolve complex ValueExpression as Sql: ${JSON.stringify(it)}`)
    }
  })

  const [nonNullValues, nullValues] = Arrays.bisect(value, (it) => (it !== null ? Eithers.left(it) : Eithers.right(null)))
  const parameters = nonNullValues.map((it) => Entries.of(`_${Ulids.generate()}`, it))
  parameters.forEach(([key, value]) => {
    context.parameters[key] = value
  })

  const containsExpression = expression.operands
    .map(map)
    .map((sql) => {
      const conditions = []

      if (!Arrays.isEmpty(parameters)) {
        conditions.push(
          `(${sql} ${invert ? 'NOT IN' : 'IN'} (${Entries.keys(parameters)
            .map((it) => `:${it}`)
            .join(',')}))`
        )
      }

      if (!Arrays.isEmpty(nullValues)) {
        conditions.push(`(${sql} ${invert ? 'IS NOT' : 'IS'} NULL)`)
      }

      return `(${conditions.join(' OR ')})`
    })
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
    return resolveContainsExpression(expression.value, map, context, true)
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
