import {
  CurriedExpression,
  Expression,
  ExpressionContext,
  ExpressionType,
  ExpressionValue,
  ExpressionVariable,
  IExpression,
  ReducingExpression,
} from '@khydrian-drift/util/expression/index'
import { ExpressionEvaluator } from '@khydrian-drift/util/expression/expression-evaluator'
import { Objects } from '@khydrian-drift/util'

export const evaluate = <T>(expression: Expression<T>, context: ExpressionContext): T => {
  return new ExpressionEvaluator(context).evaluate(valuate(expression))
}

export const value = <T>(value: T): ExpressionValue<T> => {
  return {
    type: ExpressionType.Value,
    value,
  }
}

export const isValue = <T>(expression: Expression<T>): expression is T => {
  if (!Objects.isObject(expression)) {
    return true
  }

  const result = (expression as IExpression<T>).type === undefined
  return result
}

export const valuate = <T>(expression: Expression<T>): IExpression<T> => {
  if (isValue(expression)) {
    return value(expression)
  } else {
    return expression
  }
}

export const variable = <T>(name: string): ExpressionVariable<T> => {
  return {
    type: ExpressionType.Variable,
    name,
  }
}

export const buildVariable = <T>(variable: ExpressionVariable<T>, value: T): Record<string, unknown> => {
  return { [variable.name]: value }
}

export const curry = <ArgumentType, ReturnType>(expression: ReducingExpression<ArgumentType, ReturnType>): CurriedExpression<ArgumentType, ReturnType> => {
  return {
    type: 'Curry',
    expression,
  }
}

export const unCurry = <ArgumentType, ReturnType>(
  curried: CurriedExpression<ArgumentType, ReturnType>,
  additionalOperands: Array<Expression<ArgumentType>>
): IExpression<ReturnType> => {
  const curriedExpression = curried.expression
  const operands = [...curriedExpression.operands, ...additionalOperands.map(valuate)]
  return { ...curried.expression, operands } as IExpression<ReturnType>
}

export interface CustomExpression<T> extends IExpression<T> {
  type: ExpressionType.Custom
  name: string
  args: Array<IExpression<unknown>>
}

export const custom = <T>(name: string, args: Array<Expression<unknown>>): CustomExpression<T> => {
  return {
    type: ExpressionType.Custom,
    name,
    args: args.map(valuate),
  }
}

export interface NotExpression extends IExpression<boolean> {
  type: ExpressionType.Not
  value: IExpression<boolean>
}

export const not = (value: Expression<boolean>): NotExpression => {
  return {
    type: ExpressionType.Not,
    value: valuate(value),
  }
}

export interface AndExpression extends ReducingExpression<boolean, boolean> {
  type: ExpressionType.And
  operands: Array<IExpression<boolean>>
}

export const and = (operands: Array<Expression<boolean>>): AndExpression => {
  return {
    type: ExpressionType.And,
    operands: operands.map(valuate),
  }
}

export interface OrExpression extends ReducingExpression<boolean, boolean> {
  type: ExpressionType.Or
  operands: Array<IExpression<boolean>>
}

export const or = (operands: Array<Expression<boolean>>): OrExpression => {
  return {
    type: ExpressionType.Or,
    operands: operands.map(valuate),
  }
}

export interface EqualsExpression extends IExpression<boolean> {
  type: ExpressionType.Equal
  operands: Array<IExpression<unknown>>
}

export const equals = <T>(operands: Array<Expression<T>>): EqualsExpression => {
  return {
    type: ExpressionType.Equal,
    operands: operands.map(valuate),
  }
}

export interface ContainsExpression extends IExpression<boolean> {
  type: ExpressionType.Contains
  collection: IExpression<Array<unknown>>
  operands: Array<IExpression<unknown>>
}

export const contains = <T>(collection: Expression<Array<T>>, operands: Array<Expression<T>>): ContainsExpression => {
  return {
    type: ExpressionType.Contains,
    collection: valuate(collection),
    operands: operands.map(valuate),
  }
}
