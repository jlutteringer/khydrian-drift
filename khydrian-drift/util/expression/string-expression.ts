import { Expression, ExpressionType } from '@khydrian-drift/util/expression/index'

export type ConcatenateExpression = {
  type: ExpressionType.Concatenate
  first: Expression<string>
  second: Expression<string>
}

export const concatenate = (first: Expression<string>, second: Expression<string>): Expression<string> => {
  return {
    type: ExpressionType.Concatenate,
    first,
    second,
  }
}

export type UppercaseExpression = {
  type: ExpressionType.Uppercase
  value: Expression<string>
}

export const uppercase = (value: Expression<string>): Expression<string> => {
  return {
    type: ExpressionType.Uppercase,
    value,
  }
}

export type ContainsExpression = {
  type: ExpressionType.Contains
  string: Expression<string>
  substring: Expression<string>
}

export const contains = (string: Expression<string>, substring: Expression<string>): Expression<boolean> => {
  return {
    type: ExpressionType.Contains,
    string,
    substring,
  }
}
