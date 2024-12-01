import { ExpressionContext, ExpressionType, ExpressionValue, ExpressionVariable, IExpression } from '@khydrian-drift/util/expression/index'
import { AndExpression, ContainsExpression, CustomExpression, EqualsExpression, NotExpression, OrExpression } from '@khydrian-drift/util/expression/expression'
import { Arrays, Objects, Preconditions } from '@khydrian-drift/util'
import {
  BoundsExpression,
  GreaterThanExpression,
  LessThanExpression,
  MultiplyExpression,
  SumExpression,
} from '@khydrian-drift/util/expression/numeric-expression'

export class ExpressionEvaluator {
  constructor(private readonly context: ExpressionContext) {}

  evaluate<T>(expression: IExpression<T>): T {
    switch (expression.type) {
      case ExpressionType.Value:
        return this.evaluateExpressionValue(expression as ExpressionValue<T>)
      case ExpressionType.Variable:
        return this.evaluateExpressionVariable(expression as ExpressionVariable<T>)
      case ExpressionType.Custom:
        return this.evaluateCustomExpression(expression as CustomExpression<T>)
      case ExpressionType.Not:
        return this.evaluateNotExpression(expression as NotExpression) as T
      case ExpressionType.And:
        return this.evaluateAndExpression(expression as AndExpression) as T
      case ExpressionType.Or:
        return this.evaluateOrExpression(expression as OrExpression) as T
      case ExpressionType.Equal:
        return this.evaluateEqualsExpression(expression as EqualsExpression) as T
      case ExpressionType.LessThan:
        return this.evaluateLessThanExpression(expression as LessThanExpression) as T
      case ExpressionType.GreaterThan:
        return this.evaluateGreaterThanExpression(expression as GreaterThanExpression) as T
      case ExpressionType.Contains:
        return this.evaluateContainsExpression(expression as ContainsExpression) as T
      case ExpressionType.Sum:
        return this.evaluateSumExpression(expression as SumExpression) as T
      case ExpressionType.Multiply:
        return this.evaluateMultiplyExpression(expression as MultiplyExpression) as T
      case ExpressionType.Bounds:
        return this.evaluateBoundsExpression(expression as BoundsExpression) as T
      case ExpressionType.Concatenate:
        break // TODO implement me
      case ExpressionType.Uppercase:
        break // TODO implement me
      case ExpressionType.Substring:
        break // TODO implement me
    }

    throw new Error(`Unknown Expression Type: ${expression.type}`)
  }

  private evaluateExpressionValue<T>(value: ExpressionValue<T>): T {
    return value.value
  }

  private evaluateExpressionVariable<T>(variable: ExpressionVariable<T>): T {
    const value = this.context.variables[variable.name]
    Preconditions.isPresent(value)
    return value as T
  }

  private evaluateCustomExpression<T>(expression: CustomExpression<T>): T {
    // TODO implement me
    throw new Error('Unsupported Operation')
  }

  private evaluateNotExpression(expression: NotExpression): boolean {
    return !this.evaluate(expression.value)
  }

  private evaluateAndExpression(expression: AndExpression): boolean {
    const values = expression.operands.map((it) => this.evaluate(it))
    const falseValue = values.find((it) => !it)
    return Objects.isNil(falseValue)
  }

  private evaluateOrExpression(expression: OrExpression): boolean {
    const values = expression.operands.map((it) => this.evaluate(it))
    const trueValue = values.find((it) => it)
    return Objects.isPresent(trueValue)
  }

  private evaluateEqualsExpression(expression: EqualsExpression): boolean {
    const values = expression.operands.map((it) => this.evaluate(it))

    if (values.length === 0) {
      return true
    }

    const first = values[0]
    return values.every((val) => val === first)
  }

  private evaluateContainsExpression(expression: ContainsExpression): boolean {
    const collection = this.evaluate(expression.collection)
    const values = expression.operands.map((it) => this.evaluate(it))
    return Arrays.difference(collection, values).length === 0
  }

  private evaluateLessThanExpression(expression: LessThanExpression): boolean {
    const left = this.evaluate(expression.left)
    const right = this.evaluate(expression.right)
    return left < right
  }

  private evaluateGreaterThanExpression(expression: GreaterThanExpression): boolean {
    const left = this.evaluate(expression.left)
    const right = this.evaluate(expression.right)
    return left > right
  }

  private evaluateSumExpression(expression: SumExpression): number {
    const values = expression.operands.map((it) => this.evaluate(it))
    return values.reduce((x, y) => x + y, 0)
  }

  private evaluateMultiplyExpression(expression: MultiplyExpression): number {
    console.log('evaluateMultiplyExpression', expression.operands)
    const values = expression.operands.map((it) => this.evaluate(it))
    return values.reduce((x, y) => x * y, 1)
  }

  private evaluateBoundsExpression(expression: BoundsExpression): number {
    let value = this.evaluate(expression.value)
    const minimumThreshold = Objects.isPresent(expression.minimumThreshold) ? this.evaluate(expression.minimumThreshold) : null
    const maximumThreshold = Objects.isPresent(expression.maximumThreshold) ? this.evaluate(expression.maximumThreshold) : null
    if (Objects.isPresent(minimumThreshold) && value < minimumThreshold) {
      value = minimumThreshold
    }
    if (Objects.isPresent(maximumThreshold) && value > maximumThreshold) {
      value = maximumThreshold
    }

    return value
  }
}
