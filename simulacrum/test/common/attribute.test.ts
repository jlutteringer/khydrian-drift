import { Attributes } from '@simulacrum/common'
import { Expressions, NumericExpressions } from '@simulacrum/util/expression'
import { Patches } from '@simulacrum/util'

test('Blah', () => {
  const attribute = Attributes.attribute(10, Expressions.reference(NumericExpressions.MaxExpression))
  const modifiers = [Attributes.modifier(Patches.sum(5)), Attributes.modifier(Patches.sum(5)), Attributes.modifier(Patches.sum(5))]
  const attributeValue = Attributes.evaluateAttribute(attribute, modifiers, Expressions.defaultEvaluator())
  console.log('attributeValue', attributeValue)
})
