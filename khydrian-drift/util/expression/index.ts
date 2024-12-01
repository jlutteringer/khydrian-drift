import * as NumericExpressions from '@khydrian-drift/util/expression/numeric-expression'
import * as StringExpressions from '@khydrian-drift/util/expression/string-expression'
import * as Expressions from '@khydrian-drift/util/expression/expression'

export { Expressions, NumericExpressions, StringExpressions }

export enum ExpressionType {
  Value = 'Value',
  Variable = 'Variable',
  Custom = 'Custom',
  Not = 'Not',
  And = 'And',
  Or = 'Or',
  Equal = 'Equal',
  LessThan = 'LessThan',
  GreaterThan = 'GreaterThan',
  Contains = 'Contains',
  Sum = 'Sum',
  Multiply = 'Multiply',
  Concatenate = 'Concatenate',
  Uppercase = 'Uppercase',
  Bounds = 'Bounds',
  Substring = 'Substring',
}

export interface IExpression<T> {
  type: ExpressionType
}

export type Expression<T> = T | IExpression<T>

export interface ExpressionValue<T> extends IExpression<T> {
  type: ExpressionType.Value
  value: T
}

export interface ExpressionVariable<T> extends IExpression<T> {
  type: ExpressionType.Variable
  name: string
}

export type ReducingExpression<ArgumentType, ReturnType> = IExpression<ReturnType> & {
  operands: Array<IExpression<ArgumentType>>
}

export type CurriedExpression<ArgumentType, ReturnType> = {
  type: 'Curry'
  expression: ReducingExpression<ArgumentType, ReturnType>
}

export type ExpressionContext = {
  variables: Record<string, unknown>
}
