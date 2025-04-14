import { defineExpression, isType } from '@bessemer/cornerstone/expression/internal'
import { Expression } from '@bessemer/cornerstone/expression'
import { Maths, Objects } from '@bessemer/cornerstone'
import { RoundingMode } from '@bessemer/cornerstone/math'
import { Bounds } from '@bessemer/cornerstone/range'

export const SumExpression = defineExpression({
  expressionKey: 'Numeric.Sum',
  builder: (initialOperands: Array<Expression<number>>) => {
    const operands: Array<Expression<number>> = initialOperands.flatMap((it) => {
      if (isType(it, SumExpression)) {
        return it.operands
      } else {
        return [it]
      }
    })

    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = operands.map((it) => evaluate(it))
    return values.reduce((x, y) => x + y, 0)
  },
})

export const sum = SumExpression.builder

export const MultiplyExpression = defineExpression({
  expressionKey: 'Numeric.Multiply',
  builder: (initialOperands: Array<Expression<number>>) => {
    const operands: Array<Expression<number>> = initialOperands.flatMap((it) => {
      if (isType(it, MultiplyExpression)) {
        return it.operands
      } else {
        return [it]
      }
    })

    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = operands.map((it) => evaluate(it))
    return values.reduce((x, y) => x * y, 1)
  },
})

export const multiply = MultiplyExpression.builder

export const BoundExpression = defineExpression({
  expressionKey: 'Numeric.Bound',
  builder: (value: Expression<number>, bounds: Bounds<Expression<number>>) => {
    return { value, bounds }
  },
  resolver: (expression, evaluate) => {
    let value = evaluate(expression.value)
    const minimumThreshold = Objects.isPresent(expression.bounds[0]) ? evaluate(expression.bounds[0]) : null
    const maximumThreshold = Objects.isPresent(expression.bounds[1]) ? evaluate(expression.bounds[1]) : null

    if (Objects.isPresent(minimumThreshold) && value < minimumThreshold) {
      value = minimumThreshold
    }
    if (Objects.isPresent(maximumThreshold) && value > maximumThreshold) {
      value = maximumThreshold
    }

    return value
  },
})

export const bound = BoundExpression.builder

export const FloorExpression = defineExpression({
  expressionKey: 'Numeric.Floor',
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
  expressionKey: 'Numeric.Ceiling',
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
  expressionKey: 'Numeric.Round',
  builder: (value: Expression<number>, scale: number, roundingMode: RoundingMode) => {
    return { value, scale, roundingMode }
  },
  resolver: ({ value, scale, roundingMode }, evaluate) => {
    return Maths.round(evaluate(value), scale, roundingMode)
  },
})

export const round = RoundExpression.builder

export const MinExpression = defineExpression({
  expressionKey: 'Numeric.Min',
  builder: (initialOperands: Array<Expression<number>>) => {
    const operands: Array<Expression<number>> = initialOperands.flatMap((it) => {
      if (isType(it, MinExpression)) {
        return it.operands
      } else {
        return [it]
      }
    })

    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = operands.map((it) => evaluate(it))
    return Math.min(...values)
  },
})

export const min = MinExpression.builder

export const MaxExpression = defineExpression({
  expressionKey: 'Numeric.Max',
  builder: (initialOperands: Array<Expression<number>>) => {
    const operands: Array<Expression<number>> = initialOperands.flatMap((it) => {
      if (isType(it, MaxExpression)) {
        return it.operands
      } else {
        return [it]
      }
    })

    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = operands.map((it) => evaluate(it))
    return Math.max(...values)
  },
})

export const max = MaxExpression.builder
