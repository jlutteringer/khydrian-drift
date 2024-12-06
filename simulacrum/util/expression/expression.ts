import {
  Expression,
  ExpressionContext,
  ExpressionReference,
  ExpressionType,
  ExpressionValue,
  ExpressionVariable,
  IExpression,
  ParameterizedVariable,
  ReducingExpression,
} from '@simulacrum/util/expression/index'
import { ExpressionEvaluator } from '@simulacrum/util/expression/expression-evaluator'
import { Objects, Signatures } from '@simulacrum/util'
import { Signable } from '@simulacrum/util/signature'

export const evaluate = <T>(expression: Expression<T>, context: ExpressionContext): T => {
  return new ExpressionEvaluator(context).evaluate(valuate(expression))
}

export const value = <T>(value: T): ExpressionValue<T> => {
  return {
    expressionKey: ExpressionType.Value,
    value,
  }
}

export const isValue = <T>(expression: Expression<T>): expression is T => {
  if (!Objects.isObject(expression)) {
    return true
  }

  const result = (expression as IExpression<T>).expressionKey === undefined
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
    expressionKey: ExpressionType.Variable,
    name,
  }
}

export const parameterizedVariable = <ValueType, ParameterType extends Array<Signable>>(name: string): ParameterizedVariable<ValueType, ParameterType> => {
  return {
    apply(...parameters: ParameterType): ExpressionVariable<ValueType> {
      const parameterString = parameters.map(Signatures.sign).join('.')
      return {
        expressionKey: ExpressionType.Variable,
        name: `${name}.${parameterString}`,
      }
    },
  }
}

export const buildVariable = <T>(variable: ExpressionVariable<T>, value: T): Record<string, unknown> => {
  return { [variable.name]: value }
}

export const reference = <ArgumentType, ReturnType>(
  expression: ReducingExpression<ArgumentType, ReturnType>
): ExpressionReference<ArgumentType, ReturnType> => {
  return {
    expression,
  }
}

export const invoke = <ArgumentType, ReturnType>(
  reference: ExpressionReference<ArgumentType, ReturnType>,
  operands: Array<Expression<ArgumentType>>
): IExpression<ReturnType> => {
  return { ...reference.expression, operands: operands.map(valuate) } as IExpression<ReturnType>
}

export interface CustomExpression<T> extends IExpression<T> {
  expressionKey: ExpressionType.Custom
  name: string
  args: Array<IExpression<unknown>>
}

export const custom = <T>(name: string, args: Array<Expression<unknown>>): CustomExpression<T> => {
  return {
    expressionKey: ExpressionType.Custom,
    name,
    args: args.map(valuate),
  }
}

export interface NotExpression extends IExpression<boolean> {
  expressionKey: ExpressionType.Not
  value: IExpression<boolean>
}

export const not = (value: Expression<boolean>): NotExpression => {
  return {
    expressionKey: ExpressionType.Not,
    value: valuate(value),
  }
}

export interface AndExpression extends ReducingExpression<boolean, boolean> {
  expressionKey: ExpressionType.And
  operands: Array<IExpression<boolean>>
}

export const and = (operands: Array<Expression<boolean>>): AndExpression => {
  return {
    expressionKey: ExpressionType.And,
    operands: operands.map(valuate),
  }
}

export interface OrExpression extends ReducingExpression<boolean, boolean> {
  expressionKey: ExpressionType.Or
  operands: Array<IExpression<boolean>>
}

export const or = (operands: Array<Expression<boolean>>): OrExpression => {
  return {
    expressionKey: ExpressionType.Or,
    operands: operands.map(valuate),
  }
}

export interface EqualsExpression extends IExpression<boolean> {
  expressionKey: ExpressionType.Equal
  operands: Array<IExpression<Signable>>
}

export const equals = <T extends Signable>(operands: Array<Expression<T>>): EqualsExpression => {
  return {
    expressionKey: ExpressionType.Equal,
    operands: operands.map(valuate),
  }
}

export interface ContainsExpression extends IExpression<boolean> {
  expressionKey: ExpressionType.Contains
  collection: IExpression<Array<Signable>>
  operands: Array<IExpression<Signable>>
}

export const contains = <T extends Signable>(collection: Expression<Array<T>>, operands: Array<Expression<T>>): ContainsExpression => {
  return {
    expressionKey: ExpressionType.Contains,
    collection: valuate(collection),
    operands: operands.map(valuate),
  }
}
