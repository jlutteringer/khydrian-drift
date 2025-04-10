import { BasicExpressions, Expressions } from '@bessemer/cornerstone/expression'
import { ExpressionMapper } from '@bessemer/cornerstone/expression/expression-parser'
import { Arrays, Objects, Preconditions, Ulids } from '@bessemer/cornerstone'
import { BasicType, Dictionary } from '@bessemer/cornerstone/types'

// JOHN need to add tests...
type SqlFragment = string
export type SqlExpressionMapperContext = {
  variables: Dictionary<string>
  parameters: Dictionary<BasicType>
}
export const SqlExpressionMapper = new ExpressionMapper<SqlFragment, SqlExpressionMapperContext>()

SqlExpressionMapper.register(Expressions.ValueExpression, (expression, _, context) => {
  const value = expression.value
  const parameterName = `_${Ulids.generate()}`
  if (!Objects.isBasic(value)) {
    throw new Error(`Unable to resolve complex ValueExpression as Sql: ${JSON.stringify(value)}`)
  }

  context.parameters[parameterName] = value
  return `:${parameterName}`
})
SqlExpressionMapper.register(Expressions.VariableExpression, (expression, _, context) => {
  const variableName = context.variables[expression.name]
  Preconditions.isPresent(variableName, `Unable to resolve VariableExpression with name: ${expression.name}`)
  return variableName
})
SqlExpressionMapper.register(Expressions.NotExpression, (expression, map) => {
  return `(NOT ${map(expression.value)})`
})
SqlExpressionMapper.register(Expressions.AndExpression, (expression, map) => {
  return `(${expression.operands.map(map).join(' AND ')})`
})
SqlExpressionMapper.register(Expressions.OrExpression, (expression, map) => {
  return `(${expression.operands.map(map).join(' OR ')})`
})
SqlExpressionMapper.register(Expressions.EqualsExpression, (expression, map) => {
  const first = Arrays.first(expression.operands)!
  const rest = Arrays.rest(expression.operands)

  const mappedFirst = map(first)
  const equalsExpressions = rest.map((it) => `(${mappedFirst} = ${map(it)})`).join(' AND ')
  return `(${equalsExpressions})`
})
// SqlExpressionMapper.register(Expressions.ContainsExpression, (expression, map, context) => {
//   // JOHN incomplete
//   expression.collection
//   return `(someVariable IN (${expression.collection}))`
// })
SqlExpressionMapper.register(BasicExpressions.LessThanExpression, (expression, map) => {
  return `(${map(expression.left)} < ${map(expression.right)})`
})
SqlExpressionMapper.register(BasicExpressions.LessThanOrEqualExpression, (expression, map) => {
  return `(${map(expression.left)} <= ${map(expression.right)})`
})
SqlExpressionMapper.register(BasicExpressions.GreaterThanExpression, (expression, map) => {
  return `(${map(expression.left)} > ${map(expression.right)})`
})
SqlExpressionMapper.register(BasicExpressions.GreaterThanOrEqualExpression, (expression, map) => {
  return `(${map(expression.left)} >= ${map(expression.right)})`
})
