import { defineExpression } from '@bessemer/cornerstone/expression/internal'
import { Expression } from '@bessemer/cornerstone/expression'
import { BasicType } from '@bessemer/cornerstone/types'

export const LessThanExpression = defineExpression({
  expressionKey: 'Basic.LessThan',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) < evaluate(right)
  },
})

export const lessThan = LessThanExpression.builder

export const LessThanOrEqualExpression = defineExpression({
  expressionKey: 'Basic.LessThanOrEqual',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) <= evaluate(right)
  },
})

export const lessThanOrEqual = LessThanOrEqualExpression.builder

export const GreaterThanExpression = defineExpression({
  expressionKey: 'Basic.GreaterThan',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) > evaluate(right)
  },
})

export const greaterThan = GreaterThanExpression.builder

export const GreaterThanOrEqualExpression = defineExpression({
  expressionKey: 'Basic.GreaterThanOrEqual',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) >= evaluate(right)
  },
})

export const greaterThanOrEqual = GreaterThanOrEqualExpression.builder
