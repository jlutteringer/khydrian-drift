import { defineExpression } from '@bessemer/cornerstone/expression/internal'
import { Expression } from '@bessemer/cornerstone/expression'

export const ConcatenateExpression = defineExpression({
  expressionKey: 'Concatenate',
  builder: (first: Expression<string>, second: Expression<string>) => {
    return { first, second }
  },
  resolver: (): string => {
    throw new Error('Not yet implemented')
  },
})

export const concatenate = ConcatenateExpression.builder

export const UppercaseExpression = defineExpression({
  expressionKey: 'Uppercase',
  builder: (value: Expression<string>) => {
    return { value }
  },
  resolver: (): string => {
    throw new Error('Not yet implemented')
  },
})

export const uppercase = UppercaseExpression.builder

export const SubstringExpression = defineExpression({
  expressionKey: 'Substring',
  builder: (string: Expression<string>, substring: Expression<string>) => {
    return { string, substring }
  },
  resolver: (): boolean => {
    throw new Error('Not yet implemented')
  },
})

export const substring = SubstringExpression.builder
