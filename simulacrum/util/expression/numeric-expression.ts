import { Expression } from '@simulacrum/util/expression/index'
import { RoundingMode } from '@simulacrum/util/math'
import { Maths, Objects } from '@simulacrum/util'
import { defineExpression } from '@simulacrum/util/expression/internal'

export const SumExpression = defineExpression({
  expressionKey: 'Sum',
  builder: (operands: Array<Expression<number>>) => {
    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = operands.map((it) => evaluate(it))
    return values.reduce((x, y) => x + y, 0)
  },
})

export const sum = SumExpression.builder

export const MultiplyExpression = defineExpression({
  expressionKey: 'Multiply',
  builder: (operands: Array<Expression<number>>) => {
    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = operands.map((it) => evaluate(it))
    return values.reduce((x, y) => x * y, 1)
  },
})

export const multiply = MultiplyExpression.builder

export const LessThanExpression = defineExpression({
  expressionKey: 'LessThan',
  builder: (left: Expression<number>, right: Expression<number>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) < evaluate(right)
  },
})

export const lessThan = LessThanExpression.builder

export const GreaterThanExpression = defineExpression({
  expressionKey: 'GreaterThan',
  builder: (left: Expression<number>, right: Expression<number>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) > evaluate(right)
  },
})

export const greaterThan = GreaterThanExpression.builder

export const BoundsExpression = defineExpression({
  expressionKey: 'Bounds',
  builder: (value: Expression<number>, minimumThreshold: Expression<number> | null, maximumThreshold: Expression<number> | null) => {
    return { value, minimumThreshold, maximumThreshold }
  },
  resolver: (expression, evaluate) => {
    let value = evaluate(expression.value)
    const minimumThreshold = Objects.isPresent(expression.minimumThreshold) ? evaluate(expression.minimumThreshold) : null
    const maximumThreshold = Objects.isPresent(expression.maximumThreshold) ? evaluate(expression.maximumThreshold) : null
    if (Objects.isPresent(minimumThreshold) && value < minimumThreshold) {
      value = minimumThreshold
    }
    if (Objects.isPresent(maximumThreshold) && value > maximumThreshold) {
      value = maximumThreshold
    }

    return value
  },
})

export const bounds = BoundsExpression.builder

export const FloorExpression = defineExpression({
  expressionKey: 'Floor',
  builder: (value: Expression<number>, minimumThreshold: Expression<number> | null) => {
    return { value, minimumThreshold }
  },
  resolver: (expression, evaluate) => {
    let value = evaluate(expression.value)
    const minimumThreshold = Objects.isPresent(expression.minimumThreshold) ? evaluate(expression.minimumThreshold) : null
    if (Objects.isPresent(minimumThreshold) && value < minimumThreshold) {
      value = minimumThreshold
    }

    return value
  },
})

export const floor = FloorExpression.builder

export const CeilingExpression = defineExpression({
  expressionKey: 'Ceiling',
  builder: (value: Expression<number>, maximumThreshold: Expression<number> | null) => {
    return { value, maximumThreshold }
  },
  resolver: (expression, evaluate) => {
    let value = evaluate(expression.value)
    const maximumThreshold = Objects.isPresent(expression.maximumThreshold) ? evaluate(expression.maximumThreshold) : null
    if (Objects.isPresent(maximumThreshold) && value > maximumThreshold) {
      value = maximumThreshold
    }

    return value
  },
})

export const ceiling = CeilingExpression.builder

export const RoundExpression = defineExpression({
  expressionKey: 'Round',
  builder: (value: Expression<number>, scale: number, roundingMode: RoundingMode) => {
    return { value, scale, roundingMode }
  },
  resolver: ({ value, scale, roundingMode }, evaluate) => {
    return Maths.round(evaluate(value), scale, roundingMode)
  },
})

export const round = RoundExpression.builder
