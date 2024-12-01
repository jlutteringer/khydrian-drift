import { Expression, Expressions, ExpressionType, IExpression, ReducingExpression } from '@khydrian-drift/util/expression/index'

export interface SumExpression extends ReducingExpression<number, number> {
  type: ExpressionType.Sum
  operands: Array<IExpression<number>>
}

export const sum = (operands: Array<Expression<number>>): SumExpression => {
  return {
    type: ExpressionType.Sum,
    operands: operands.map(Expressions.valuate),
  }
}

export interface MultiplyExpression extends ReducingExpression<number, number> {
  type: ExpressionType.Multiply
  operands: Array<IExpression<number>>
}

export const multiply = (operands: Array<Expression<number>>): MultiplyExpression => {
  return {
    type: ExpressionType.Multiply,
    operands: operands.map(Expressions.valuate),
  }
}

export interface LessThanExpression extends IExpression<boolean> {
  type: ExpressionType.LessThan
  left: IExpression<number>
  right: IExpression<number>
}

export const lessThan = (left: Expression<number>, right: Expression<number>): LessThanExpression => {
  return {
    type: ExpressionType.LessThan,
    left: Expressions.valuate(left),
    right: Expressions.valuate(right),
  }
}

export interface GreaterThanExpression extends IExpression<boolean> {
  type: ExpressionType.GreaterThan
  left: IExpression<number>
  right: IExpression<number>
}

export interface BoundsExpression extends IExpression<number> {
  type: ExpressionType.Bounds
  value: IExpression<number>
  minimumThreshold: IExpression<number> | null
  maximumThreshold: IExpression<number> | null
}

export const floor = (value: Expression<number>, minimumThreshold: Expression<number>): BoundsExpression => {
  return {
    type: ExpressionType.Bounds,
    value: Expressions.valuate(value),
    minimumThreshold: Expressions.valuate(minimumThreshold),
    maximumThreshold: null,
  }
}

export const ceiling = (value: Expression<number>, maximumThreshold: Expression<number>): BoundsExpression => {
  return {
    type: ExpressionType.Bounds,
    value: Expressions.valuate(value),
    minimumThreshold: null,
    maximumThreshold: Expressions.valuate(maximumThreshold),
  }
}

export const bounds = (value: Expression<number>, minimumThreshold: Expression<number>, maximumThreshold: Expression<number>): BoundsExpression => {
  return {
    type: ExpressionType.Bounds,
    value: Expressions.valuate(value),
    minimumThreshold: Expressions.valuate(minimumThreshold),
    maximumThreshold: Expressions.valuate(maximumThreshold),
  }
}
