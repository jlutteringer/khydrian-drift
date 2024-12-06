import { Expression, Expressions, ExpressionType, IExpression } from '@simulacrum/util/expression/index'

export interface ConcatenateExpression extends IExpression<string> {
  expressionKey: ExpressionType.Concatenate
  first: IExpression<string>
  second: IExpression<string>
}

export const concatenate = (first: Expression<string>, second: Expression<string>): ConcatenateExpression => {
  return {
    expressionKey: ExpressionType.Concatenate,
    first: Expressions.valuate(first),
    second: Expressions.valuate(second),
  }
}

export interface UppercaseExpression extends IExpression<string> {
  expressionKey: ExpressionType.Uppercase
  value: IExpression<string>
}

export const uppercase = (value: Expression<string>): UppercaseExpression => {
  return {
    expressionKey: ExpressionType.Uppercase,
    value: Expressions.valuate(value),
  }
}

export interface SubstringExpression extends IExpression<boolean> {
  expressionKey: ExpressionType.Substring
  string: IExpression<string>
  substring: IExpression<string>
}

export const substring = (string: Expression<string>, substring: Expression<string>): SubstringExpression => {
  return {
    expressionKey: ExpressionType.Substring,
    string: Expressions.valuate(string),
    substring: Expressions.valuate(substring),
  }
}
