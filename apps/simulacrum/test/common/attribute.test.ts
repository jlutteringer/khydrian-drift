import { Attributes, ResourcePools } from '@simulacrum/common'
import { GameTimeUnit, RelativeAmount } from '@simulacrum/common/types'
import { Patches } from '@bessemer/cornerstone'
import { Expressions, NumericExpressions } from '@bessemer/cornerstone/expression'

test('Test Numeric Attibutes and Combinations', () => {
  {
    const attribute = Attributes.attribute(10, Expressions.reference(NumericExpressions.MaxExpression))
    const modifiers = [Attributes.modifier(Patches.sum(5)), Attributes.modifier(Patches.sum(5)), Attributes.modifier(Patches.sum(5))]
    const attributeValue = Attributes.evaluateAttribute(attribute, modifiers, Expressions.defaultEvaluator())

    expect(attributeValue.value).toEqual(25)
    expect(attributeValue.initialValue).toEqual(10)
    expect(attributeValue.activeModifiers.length).toEqual(3)
    expect(attributeValue.activeModifiers[2].value).toEqual(25)
    expect(attributeValue.inactiveModifiers.length).toEqual(0)
  }

  {
    const attribute = Attributes.attribute(10, Expressions.reference(NumericExpressions.MaxExpression))
    const modifiers = [Attributes.modifier(Patches.multiply(5)), Attributes.modifier(Patches.sum(5)), Attributes.modifier(Patches.sum(5))]
    const attributeValue = Attributes.evaluateAttribute(attribute, modifiers, Expressions.defaultEvaluator())

    expect(attributeValue.value).toEqual(100)
    expect(attributeValue.initialValue).toEqual(10)
    expect(attributeValue.activeModifiers.length).toEqual(3)
    expect(attributeValue.activeModifiers[2].value).toEqual(100)
    expect(attributeValue.activeModifiers[2].modifier).toEqual(Attributes.modifier(Patches.multiply(5)))
    expect(attributeValue.inactiveModifiers.length).toEqual(0)
  }

  {
    const attribute = Attributes.attribute(10, Expressions.reference(NumericExpressions.MaxExpression))
    const modifiers = [
      Attributes.modifier(Patches.multiply(5), { condition: Expressions.and([false]) }),
      Attributes.modifier(Patches.sum(5), { condition: Expressions.or([true]) }),
      Attributes.modifier(Patches.sum(5), { condition: Expressions.and([false]) }),
    ]
    const attributeValue = Attributes.evaluateAttribute(attribute, modifiers, Expressions.defaultEvaluator())

    expect(attributeValue.value).toEqual(15)
    expect(attributeValue.initialValue).toEqual(10)
    expect(attributeValue.activeModifiers.length).toEqual(1)
    expect(attributeValue.activeModifiers[0].value).toEqual(15)
    expect(attributeValue.activeModifiers[0].modifier).toEqual(Attributes.modifier(Patches.sum(5), { condition: Expressions.or([true]) }))
    expect(attributeValue.inactiveModifiers.length).toEqual(2)
  }
})

test('Test Objects', () => {
  {
    const resourcePool = ResourcePools.defineResourcePool('test-resource-pool', {
      name: 'Hit Points',
      path: 'hitPoints',
      description: '',
      size: 10,
      refresh: [{ period: GameTimeUnit.LongRest, amount: RelativeAmount.All }],
    })

    // TODO any way to fix the cast issue...?
    // const attribute = Attributes.attribute(resourcePool, Expressions.reference(ArrayExpressions.FirstExpression as any))
    // const modifiers = [
    //   Attributes.modifier(
    //     Patches.patch<ResourcePoolDefinition>({
    //       size: Patches.multiply(5),
    //     })
    //   ),
    //   Attributes.modifier(
    //     Patches.patch<ResourcePoolDefinition>({
    //       size: Patches.sum(5),
    //     })
    //   ),
    //   Attributes.modifier(
    //     Patches.patch<ResourcePoolDefinition>({
    //       size: Patches.sum(5),
    //     })
    //   ),
    // ]
    // const attributeValue = Attributes.evaluateAttribute(attribute, modifiers, Expressions.defaultEvaluator())
  }
})
