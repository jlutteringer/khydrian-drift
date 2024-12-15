import * as NumericExpressions from '@simulacrum/util/expression/numeric-expression'
import * as StringExpressions from '@simulacrum/util/expression/string-expression'
import * as ArrayExpressions from '@simulacrum/util/expression/array-expression'
import * as Expressions from '@simulacrum/util/expression/expression'
import { Signable } from '@simulacrum/util/signature'
import { GenericRecord, NominalType } from '@simulacrum/util/types'

export { Expressions, NumericExpressions, StringExpressions, ArrayExpressions }

export type ExpressionKey<ReturnType, ArgumentType extends Array<unknown>> = NominalType<string, ['ExpressionKey', ReturnType, ArgumentType]>

export type Expression<ReturnType> = ReturnType | IExpression<ReturnType>

export interface IExpression<ReturnType> {
  expressionKey: ExpressionKey<ReturnType, Array<unknown>>
}

export interface ExpressionReference<ReturnType, ArgumentType extends Array<unknown>> {
  expressionKey: ExpressionKey<ReturnType, ArgumentType>
}

export interface ReducingExpression<ReturnType, ArgumentType> extends ExpressionReference<ReturnType, [Array<Expression<ArgumentType>>]> {}

export type EvaluateExpression = <T>(expression: Expression<T>) => T

export type ExpressionDefinition<ReturnType, ArgumentType extends Array<unknown>, ExpressionType extends Expression<ReturnType>> = ExpressionReference<
  ReturnType,
  ArgumentType
> & {
  expressionKey: ExpressionKey<ReturnType, ArgumentType>
  builder: (...parameters: ArgumentType) => ExpressionType
  resolver: (expression: ExpressionType, evaluate: EvaluateExpression, context: ExpressionContext) => ReturnType
}

export interface ExpressionVariable<T> extends IExpression<T> {
  expressionKey: 'Variable'
  name: string
}

export interface ParameterizedVariable<ValueType, ParameterType extends Array<Signable>> {
  apply(...parameters: ParameterType): ExpressionVariable<ValueType>
}

export type ExpressionContext = {
  variables: GenericRecord
}
