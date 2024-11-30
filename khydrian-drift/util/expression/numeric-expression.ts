import { Expression, ExpressionType } from '@khydrian-drift/util/expression/index'

export type SumExpression = {
  type: ExpressionType.Sum
  operands: Array<Expression<number>>
}

export const sum = (operands: Array<Expression<number>>): Expression<number> => {
  return {
    type: ExpressionType.Sum,
    operands,
  }
}

export type MultiplyExpression = {
  type: ExpressionType.Multiply
  operands: Array<Expression<number>>
}

export const multiply = (operands: Array<Expression<number>>): Expression<number> => {
  return {
    type: ExpressionType.Multiply,
    operands,
  }
}

export type LessThanExpression = {
  type: ExpressionType.LessThan
  left: Expression<number>
  right: Expression<number>
}

export const lessThan = (left: Expression<number>, right: Expression<number>): Expression<boolean> => {
  return {
    type: ExpressionType.LessThan,
    left,
    right,
  }
}

export type GreaterThanExpression = {
  type: ExpressionType.GreaterThan
  left: Expression<number>
  right: Expression<number>
}

export type BoundsExpression = {
  type: ExpressionType.Bounds
  value: Expression<number>
  minimumThreshold: Expression<number> | null
  maximumThreshold: Expression<number> | null
}

export const min = (value: Expression<number>, minimumThreshold: Expression<number>): Expression<number> => {
  return {
    type: ExpressionType.Bounds,
    value,
    minimumThreshold,
    maximumThreshold: null,
  }
}
