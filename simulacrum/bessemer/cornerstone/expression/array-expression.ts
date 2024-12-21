import { defineExpression } from '@bessemer/cornerstone/expression/internal'
import { Expression } from '@bessemer/cornerstone/expression'
import { Arrays } from '@bessemer/cornerstone'

export const ConcatenateExpression = defineExpression({
  expressionKey: 'Array.Concatenate',
  builder: (operands: Array<Expression<Array<Expression<unknown>>>>) => {
    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = evaluate(operands).map((it) => evaluate(it))
    return Arrays.concatenate(values[0], ...Arrays.rest(values))
  },
})

export const concatenate = ConcatenateExpression.builder

export const FirstExpression = defineExpression({
  expressionKey: 'Array.First',
  builder: (operands: Array<Expression<Array<Expression<unknown>>>>) => {
    return { operands }
  },
  resolver: ({ operands }, evaluate) => {
    const values = evaluate(operands).map((it) => evaluate(it))
    return Arrays.first(values)
  },
})

export const first = FirstExpression.builder
