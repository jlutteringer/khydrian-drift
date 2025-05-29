import { defineExpression } from '@bessemer/cornerstone/expression/internal'
import { Expression } from '@bessemer/cornerstone/expression'
import { BasicType } from '@bessemer/cornerstone/types'
import { Arrays, Assertions, Objects, Signatures } from '@bessemer/cornerstone'
import { Signable } from '@bessemer/cornerstone/signature'

export const ValueExpression = defineExpression({
  expressionKey: 'Value',
  builder: (value: unknown) => {
    return { value }
  },
  resolver: ({ value }, evaluate, context) => {
    return value
  },
})

export const VariableExpression = defineExpression({
  expressionKey: 'Variable',
  builder: (name: string) => {
    return { name }
  },
  resolver: ({ name }, evaluate, context) => {
    const value = context.variables[name]
    Assertions.assertPresent(value)
    return value
  },
})

export const NotExpression = defineExpression({
  expressionKey: 'Not',
  builder: (value: Expression<boolean>) => {
    return { value }
  },
  resolver: (expression, evaluate) => {
    return !evaluate(expression.value)
  },
})

export const AndExpression = defineExpression({
  expressionKey: 'And',
  builder: (operands: Array<Expression<boolean>>) => {
    return { operands }
  },
  resolver: (expression, evaluate) => {
    const values = expression.operands.map((it) => evaluate(it))
    const falseValue = values.find((it) => !it)
    return Objects.isNil(falseValue)
  },
})

export const OrExpression = defineExpression({
  expressionKey: 'Or',
  builder: (operands: Array<Expression<boolean>>) => {
    return { operands }
  },
  resolver: (expression, evaluate) => {
    const values = expression.operands.map((it) => evaluate(it))
    const trueValue = values.find((it) => it)
    return Objects.isPresent(trueValue)
  },
})

export const EqualsExpression = defineExpression({
  expressionKey: 'Equals',
  builder: (operands: Array<Expression<Signable>>) => {
    return { operands }
  },
  resolver: (expression, evaluate) => {
    const values = expression.operands.map((it) => evaluate(it)).map(Signatures.sign)

    if (values.length === 0) {
      return true
    }

    const first = values[0]
    return values.every((val) => val === first)
  },
})

export const ContainsExpression = defineExpression({
  expressionKey: 'Contains',
  builder: (collection: Expression<Array<Signable>>, operands: Array<Expression<Signable>>) => {
    return { collection, operands }
  },
  resolver: (expression, evaluate) => {
    const collection = evaluate(expression.collection)
    const values = expression.operands.map((it) => evaluate(it))
    return Arrays.containsAll(collection, values)
  },
})

export const LessThanExpression = defineExpression({
  expressionKey: 'Basic.LessThan',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) < evaluate(right)
  },
})

export const LessThanOrEqualExpression = defineExpression({
  expressionKey: 'Basic.LessThanOrEqual',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) <= evaluate(right)
  },
})

export const GreaterThanExpression = defineExpression({
  expressionKey: 'Basic.GreaterThan',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) > evaluate(right)
  },
})

export const GreaterThanOrEqualExpression = defineExpression({
  expressionKey: 'Basic.GreaterThanOrEqual',
  builder: (left: Expression<BasicType>, right: Expression<BasicType>) => {
    return { left, right }
  },
  resolver: ({ left, right }, evaluate) => {
    return evaluate(left) >= evaluate(right)
  },
})
