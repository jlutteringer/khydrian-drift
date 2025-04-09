import { ExpressionEvaluator } from '@bessemer/cornerstone/expression/expression-evaluator'
import {
  ArrayExpressions, BasicExpressions,
  EvaluateExpression,
  Expression,
  ExpressionContext,
  ExpressionDefinition,
  ExpressionReference,
  ExpressionVariable,
  NumericExpressions,
  ParameterizedVariable,
  StringExpressions
} from '@bessemer/cornerstone/expression'
import { Arrays, Objects, Preconditions, Signatures } from '@bessemer/cornerstone'
import { Signable } from '@bessemer/cornerstone/signature'
import { defineExpression } from '@bessemer/cornerstone/expression/internal'
import { UnknownRecord } from 'type-fest'
import { BasicType } from '@bessemer/cornerstone/types'

export const evaluate = <T>(expression: Expression<T>, context: ExpressionContext): T => {
  return new ExpressionEvaluator(DEFAULT_EXPRESSION_DEFINITIONS).evaluate(expression, context)
}

export const evaluateDefault = <T>(expression: Expression<T>): T => {
  return evaluate(expression, defaultContext())
}

export const evaluator = (context: ExpressionContext): EvaluateExpression => {
  return (it) => evaluate(it, context)
}

export const defaultEvaluator = (): EvaluateExpression => {
  return evaluator(defaultContext())
}

export const defaultContext = (): ExpressionContext => {
  return { variables: {} }
}

export const dereference = <ReturnType, ArgumentType extends Array<unknown>>(
  reference: ExpressionReference<ReturnType, ArgumentType>,
  ...args: ArgumentType
): Expression<ReturnType> => {
  return new ExpressionEvaluator(DEFAULT_EXPRESSION_DEFINITIONS).dereference(reference, ...args)
}

export const parameterizedVariable = <ValueType, ParameterType extends Array<Signable>>(
  name: string
): ParameterizedVariable<ValueType, ParameterType> => {
  return {
    apply(...parameters: ParameterType): ExpressionVariable<ValueType> {
      const parameterString = parameters.map(Signatures.sign).join('.')
      return variable(`${name}.${parameterString}`)
    },
  }
}

export const buildVariable = <T>(variable: ExpressionVariable<T>, value: T): UnknownRecord => {
  return { [variable.name]: value }
}

export const reference = <ReturnType, ArgumentType extends Array<unknown>, ExpressionType extends Expression<ReturnType>>(
  expressionDefinition: ExpressionDefinition<ReturnType, ArgumentType, ExpressionType>
): ExpressionReference<ReturnType, ArgumentType> => {
  return { expressionKey: expressionDefinition.expressionKey }
}

export const ValueExpression = defineExpression({
  expressionKey: 'Value',
  builder: (value: unknown) => {
    return { value }
  },
  resolver: ({ value }, evaluate, context) => {
    return value
  },
})

export const value = <T>(value: T): Expression<T> => ValueExpression.builder(value) as Expression<T>

export const VariableExpression = defineExpression({
  expressionKey: 'Variable',
  builder: (name: string) => {
    return { name }
  },
  resolver: ({ name }, evaluate, context) => {
    const value = context.variables[name]
    Preconditions.isPresent(value)
    return value
  },
})

export const variable = <T>(name: string): ExpressionVariable<T> => VariableExpression.builder(name) as ExpressionVariable<T>

export const NotExpression = defineExpression({
  expressionKey: 'Not',
  builder: (value: Expression<boolean>) => {
    return { value }
  },
  resolver: (expression, evaluate) => {
    return !evaluate(expression.value)
  },
})

export const not = NotExpression.builder

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

export const and = AndExpression.builder

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

export const or = OrExpression.builder

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

export const equals = EqualsExpression.builder

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

export const contains = ContainsExpression.builder

const DEFAULT_EXPRESSION_DEFINITIONS: Array<ExpressionDefinition<unknown, Array<any>, Expression<any>>> = [
  ValueExpression,
  VariableExpression,
  AndExpression,
  OrExpression,
  ContainsExpression,
  EqualsExpression,
  BasicExpressions.LessThanExpression,
  BasicExpressions.LessThanOrEqualExpression,
  BasicExpressions.GreaterThanExpression,
  BasicExpressions.GreaterThanOrEqualExpression,
  NumericExpressions.SumExpression,
  NumericExpressions.MultiplyExpression,
  NumericExpressions.FloorExpression,
  NumericExpressions.CeilingExpression,
  NumericExpressions.BoundsExpression,
  NumericExpressions.RoundExpression,
  NumericExpressions.MaxExpression,
  NumericExpressions.MinExpression,
  StringExpressions.ConcatenateExpression,
  StringExpressions.SubstringExpression,
  StringExpressions.UppercaseExpression,
  ArrayExpressions.ConcatenateExpression,
  ArrayExpressions.FirstExpression,
]
