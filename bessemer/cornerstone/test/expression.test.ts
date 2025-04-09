import { BasicExpressions, Expressions, NumericExpressions, StringExpressions } from '@bessemer/cornerstone/expression'

test('TODO', () => {
  NumericExpressions.sum([Expressions.variable('VitalityPoints'), 10])

  Expressions.equals([NumericExpressions.sum([Expressions.variable('VitalityPoints'), 10]), 5])

  Expressions.and([
    BasicExpressions.lessThan(NumericExpressions.sum([Expressions.variable('VitalityPoints'), 10]), 15),
    StringExpressions.substring('one', 'two'),
  ])
})
