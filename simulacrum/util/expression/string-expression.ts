import { Expression } from '@simulacrum/util/expression/index'
import { defineExpression } from '@simulacrum/util/expression/internal'

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
  resolver: (): string => {
    throw new Error('Not yet implemented')
  },
})

export const substring = SubstringExpression.builder
