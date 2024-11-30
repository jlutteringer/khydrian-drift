import * as NumericExpressions from '@khydrian-drift/util/expression/numeric-expression'
import {
  BoundsExpression,
  GreaterThanExpression,
  LessThanExpression,
  MultiplyExpression,
  SumExpression,
} from '@khydrian-drift/util/expression/numeric-expression'
import * as StringExpressions from '@khydrian-drift/util/expression/string-expression'
import { ConcatenateExpression, ContainsExpression, UppercaseExpression } from '@khydrian-drift/util/expression/string-expression'
import * as Expressions from '@khydrian-drift/util/expression/expression'
import { AndExpression, CustomExpression, EqualsExpression, NotExpression, OrExpression } from '@khydrian-drift/util/expression/expression'

export { Expressions, NumericExpressions, StringExpressions }

export enum ExpressionType {
  Variable = 'Variable',
  Curry = 'Curry',
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
}

export type ExpressionVariable<T> = {
  type: ExpressionType.Variable
  name: string
}

export type Expression<T> =
  | T
  | ExpressionVariable<T>
  | CustomExpression
  | NotExpression
  | AndExpression
  | OrExpression
  | EqualsExpression
  | SumExpression
  | MultiplyExpression
  | LessThanExpression
  | GreaterThanExpression
  | ConcatenateExpression
  | UppercaseExpression
  | ContainsExpression
  | BoundsExpression

export type CurryableExpression<ArgumentType, ReturnType> = Expression<ReturnType> & {
  operands: Array<Expression<ArgumentType>>
}

export type CurriedExpression<ArgumentType, ReturnType> = {
  type: ExpressionType.Curry
  expression: CurryableExpression<ArgumentType, ReturnType>
}
