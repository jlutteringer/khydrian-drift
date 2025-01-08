import { Expressions, NumericExpressions, StringExpressions } from '@bessemer/cornerstone/expression'

test('TODO', () => {
  NumericExpressions.sum([Expressions.variable('VitalityPoints'), 10])

  Expressions.equals([NumericExpressions.sum([Expressions.variable('VitalityPoints'), 10]), 5])

  Expressions.and([
    NumericExpressions.lessThan(NumericExpressions.sum([Expressions.variable('VitalityPoints'), 10]), 15),
    StringExpressions.substring('one', 'two'),
  ])
})
