import { Expressions } from '@bessemer/cornerstone/expression'
import { Sql } from '@bessemer/cornerstone/sql'
import { Dates } from '@bessemer/cornerstone'

test('Sql.parseExpression', () => {
  const variables = {
    test: 'test_1',
    test2: 'test_2',
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.lessThan(Expressions.variable('test'), 10), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.lessThanOrEqual(10, Expressions.variable('test')), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.greaterThan(Expressions.variable('test'), Dates.now()), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.greaterThanOrEqual(Dates.now(), Expressions.variable('test')), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.not(Expressions.equals([Expressions.variable('test'), Dates.now()])), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(
      Expressions.and([Expressions.lessThan(Expressions.variable('test'), 10), Expressions.equals([Expressions.variable('test2'), Dates.now()])]),
      variables
    )
  }

  {
    const [fragment, parameters] = Sql.parseExpression(
      Expressions.or([Expressions.lessThan(Expressions.variable('test'), 10), Expressions.equals([Expressions.variable('test2'), Dates.now()])]),
      variables
    )
  }

  {
    const [fragment, parameters] = Sql.parseExpression(
      Expressions.equals([Expressions.variable('test'), Expressions.variable('test2'), 10]),
      variables
    )
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.contains([1, 2, 3], [Expressions.variable('test')]), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.not(Expressions.contains([1, 2, 3], [Expressions.variable('test')])), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.equals([Expressions.variable('test'), null]), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.equals([Expressions.variable('test'), null]), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.contains([], [Expressions.variable('test')]), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.contains([null], [Expressions.variable('test')]), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.contains([1, 2, null], [Expressions.variable('test')]), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.not(Expressions.equals([Expressions.variable('test'), null])), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.not(Expressions.contains([], [Expressions.variable('test')])), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.not(Expressions.contains([null], [Expressions.variable('test')])), variables)
  }

  {
    const [fragment, parameters] = Sql.parseExpression(Expressions.not(Expressions.contains([1, 2, null], [Expressions.variable('test')])), variables)
  }
})
