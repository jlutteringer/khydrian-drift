import * as NumericExpressions from '@khydrian-drift/util/expression/numeric-expression'
import * as StringExpressions from '@khydrian-drift/util/expression/string-expression'
import * as Expressions from '@khydrian-drift/util/expression/expression'
import { Signable } from '@khydrian-drift/util/signature'

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
  expressionKey: ExpressionType
}

export type Expression<T> = T | IExpression<T>

export interface ExpressionValue<T> extends IExpression<T> {
  expressionKey: ExpressionType.Value
  value: T
}

export interface ExpressionVariable<T> extends IExpression<T> {
  expressionKey: ExpressionType.Variable
  name: string
}

export interface ParameterizedVariable<ValueType, ParameterType extends Array<Signable>> {
  apply(...parameters: ParameterType): ExpressionVariable<ValueType>
}

export type ReducingExpression<ArgumentType, ReturnType> = IExpression<ReturnType> & {
  operands: Array<IExpression<ArgumentType>>
}

// TODO this could probably be made more robust... right now we only support references for 'reducing expressions'... generalizing is kinda hard tho
export type ExpressionReference<ArgumentType, ReturnType> = {
  expression: ReducingExpression<ArgumentType, ReturnType>
}

export type ExpressionContext = {
  variables: Record<string, unknown>
}
