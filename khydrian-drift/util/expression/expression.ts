import { CurriedExpression, CurryableExpression, Expression, ExpressionType, ExpressionVariable } from '@khydrian-drift/util/expression/index'

export const variable = <T>(name: string): ExpressionVariable<T> => {
  return {
    type: ExpressionType.Variable,
    name,
  }
}

export const curry = <ArgumentType, ReturnType>(expression: CurryableExpression<ArgumentType, ReturnType>): CurriedExpression<ArgumentType, ReturnType> => {
  return {
    type: ExpressionType.Curry,
    expression,
  }
}

export const unCurry = <ArgumentType, ReturnType>(
  curried: CurriedExpression<ArgumentType, ReturnType>,
  additionalOperands: Array<Expression<ArgumentType>>
): Expression<ReturnType> => {
  const curriedExpression = curried.expression
  const operands = [...curriedExpression.operands, additionalOperands]
  return { ...curried.expression, operands } as Expression<ReturnType>
}

export type CustomExpression = {
  type: ExpressionType.Custom
  name: string
  args: Array<Expression<unknown>>
}

export const custom = <T>(name: string, args: Array<Expression<unknown>>): Expression<T> => {
  return {
    type: ExpressionType.Custom,
    name,
    args,
  }
}

export type NotExpression = {
  type: ExpressionType.Not
  value: Expression<boolean>
}

export const not = (value: Expression<boolean>): Expression<boolean> => {
  return {
    type: ExpressionType.Not,
    value,
  }
}

export type AndExpression = {
  type: ExpressionType.And
  values: Array<Expression<boolean>>
}

export const and = (values: Array<Expression<boolean>>): Expression<boolean> => {
  return {
    type: ExpressionType.And,
    values,
  }
}

export type OrExpression = {
  type: ExpressionType.Or
  values: Array<Expression<boolean>>
}

export const or = (values: Array<Expression<boolean>>): Expression<boolean> => {
  return {
    type: ExpressionType.Or,
    values,
  }
}

export type EqualsExpression = {
  type: ExpressionType.Equal
  first: Expression<unknown>
  second: Expression<unknown>
}

export const equals = <T>(first: Expression<T>, second: Expression<T>): Expression<boolean> => {
  return {
    type: ExpressionType.Equal,
    first,
    second,
  }
}
