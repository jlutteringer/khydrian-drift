import { ExpressionEvaluator } from '@bessemer/cornerstone/expression/expression-evaluator'
import {
  ArrayExpressions,
  EvaluateExpression,
  Expression,
  ExpressionContext,
  ExpressionDefinition,
  ExpressionReference,
  ExpressionVariable,
  NumericExpressions,
  ParameterizedVariable,
  StringExpressions,
} from '@bessemer/cornerstone/expression'
import { Signatures } from '@bessemer/cornerstone'
import { Signable } from '@bessemer/cornerstone/signature'
import { UnknownRecord } from 'type-fest'
import {
  AndExpression,
  ContainsExpression,
  EqualsExpression,
  GreaterThanExpression,
  GreaterThanOrEqualExpression,
  LessThanExpression,
  LessThanOrEqualExpression,
  NotExpression,
  OrExpression,
  ValueExpression,
  VariableExpression,
} from '@bessemer/cornerstone/expression/core-expression'
import { ExpressionMapper } from '@bessemer/cornerstone/expression/expression-mapper'

export const evaluate = <T>(expression: Expression<T>, context: ExpressionContext): T => {
  return new ExpressionEvaluator(DEFAULT_EXPRESSION_DEFINITIONS).evaluate(expression, context)
}

export const evaluateDefault = <T>(expression: Expression<T>): T => {
  return evaluate(expression, defaultContext())
}

export const map = <MappingType, ContextType>(
  expression: Expression<unknown>,
  mapper: ExpressionMapper<MappingType, ContextType>,
  context: ContextType
): MappingType => {
  return mapper.map(expression, context)
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

export const value = <T>(value: T): Expression<T> => {
  return ValueExpression.builder(value) as Expression<T>
}

export const variable = <T>(name: string): ExpressionVariable<T> => {
  return VariableExpression.builder(name) as ExpressionVariable<T>
}

export const not = NotExpression.builder

export const and = AndExpression.builder

export const or = OrExpression.builder

export const equals = EqualsExpression.builder

export const contains = ContainsExpression.builder

export const lessThan = LessThanExpression.builder

export const lessThanOrEqual = LessThanOrEqualExpression.builder

export const greaterThan = GreaterThanExpression.builder

export const greaterThanOrEqual = GreaterThanOrEqualExpression.builder

const DEFAULT_EXPRESSION_DEFINITIONS: Array<ExpressionDefinition<unknown, Array<any>, Expression<any>>> = [
  ValueExpression,
  VariableExpression,
  AndExpression,
  OrExpression,
  ContainsExpression,
  EqualsExpression,
  LessThanExpression,
  LessThanOrEqualExpression,
  GreaterThanExpression,
  GreaterThanOrEqualExpression,
  NumericExpressions.SumExpression,
  NumericExpressions.MultiplyExpression,
  NumericExpressions.FloorExpression,
  NumericExpressions.CeilingExpression,
  NumericExpressions.BoundExpression,
  NumericExpressions.RoundExpression,
  NumericExpressions.MaxExpression,
  NumericExpressions.MinExpression,
  StringExpressions.ConcatenateExpression,
  StringExpressions.SubstringExpression,
  StringExpressions.UppercaseExpression,
  ArrayExpressions.ConcatenateExpression,
  ArrayExpressions.FirstExpression,
]
