import { Patch } from '@simulacrum/util/patch'
import { Combinability } from '@simulacrum/util/combinable'
import { EvaluateExpression, Expression, Expressions, ReducingExpression } from '@simulacrum/util/expression'
import { Arrays, Combinables, Equalitors, Objects, Patches } from '@simulacrum/util'

export type Attribute<T> = {
  baseValue: Expression<T>
  optimizer: ReducingExpression<T, T>
}

export type AttributeValue<T> = {
  value: T
  initialValue: T
  activeModifiers: Array<ModifierValue<T>>
  inactiveModifiers: Array<Modifier<T>>
  attribute: Attribute<T>
}

export type Modifier<T> = {
  value: Patch<T>
  combinability: Combinability
  condition?: Expression<boolean>
  // JOHN
  // source: EffectSource | null
}

export type ModifierValue<T> = {
  value: T
  modifier: Modifier<T>
}

export type EvaluateModifiersResponse<T> = {
  activeModifiers: Array<Modifier<T>>
  inactiveModifiers: Array<Modifier<T>>
}

export const attribute = <T>(baseValue: Expression<T>, optimizer: ReducingExpression<T, T>): Attribute<T> => {
  return {
    baseValue,
    optimizer,
  }
}

export const modifier = <T>(
  value: Patch<T>,
  options?: {
    combinability?: Combinability
    condition?: Expression<boolean>
  }
): Modifier<T> => {
  return {
    value,
    combinability: options?.combinability ?? Combinables.DefaultCombinability,
    ...(Objects.isPresent(options?.condition) ? { condition: options?.condition } : {}),
  }
}

export const buildModifierValue = <T>(value: T, modifier: Modifier<T>): ModifierValue<T> => {
  return { value, modifier }
}

export const evaluateModifiers = <T>(modifiers: Array<Modifier<T>>, evaluate: EvaluateExpression): EvaluateModifiersResponse<T> => {
  const activeModifiers: Array<Modifier<T>> = []
  const inactiveModifiers: Array<Modifier<T>> = []

  for (const modifier of modifiers) {
    if (Objects.isNil(modifier.condition)) {
      activeModifiers.push(modifier)
    } else {
      const result = evaluate(modifier.condition)
      if (result) {
        activeModifiers.push(modifier)
      } else {
        inactiveModifiers.push(modifier)
      }
    }
  }

  return { activeModifiers, inactiveModifiers }
}

export const simpleAttributeValue = <T>(value: T, attribute: Attribute<T>): AttributeValue<T> => {
  return {
    value,
    initialValue: value,
    activeModifiers: [],
    inactiveModifiers: [],
    attribute,
  }
}

export const evaluateAttribute = <T>(attribute: Attribute<T>, modifiers: Array<Modifier<T>>, evaluate: EvaluateExpression): AttributeValue<T> => {
  const initialValue = evaluate(attribute.baseValue)
  const { activeModifiers, inactiveModifiers } = evaluateModifiers(modifiers, evaluate)
  const modifierCombinations = Combinables.combinations(activeModifiers)

  // JOHN we should refactor expressions to make this impossible.... but later
  // evaluate(Expressions.dereference(reducer, []))
  // evaluate(reducer)

  const combinationValues: Array<[T, Array<ModifierValue<T>>]> = modifierCombinations.map((combination) => {
    const permutationValues: Array<[T, Array<ModifierValue<T>>]> = Arrays.permute(combination).map((permutations) => {
      const { value, patchValues } = Patches.resolveWithDetails(
        initialValue,
        permutations.map((it) => it.value),
        evaluate
      )

      const modifierValues = permutations.map((it) => {
        return buildModifierValue(patchValues.find((patch) => it.value === patch.patch)!.value, it)
      })

      return [value, modifierValues]
    })

    const winningPermutationValue = evaluate(Expressions.dereference(attribute.optimizer, permutationValues.map(Arrays.first)))
    const [_, winningModifiers] = permutationValues.find((it) => winningPermutationValue === Arrays.first(it)) ?? []
    return [winningPermutationValue, winningModifiers ?? []]
  })

  let value: T
  let winningModifiers: Array<ModifierValue<T>> = []
  let additionalInactiveModifiers: Array<Modifier<T>> = []
  if (Arrays.isEmpty(combinationValues)) {
    value = initialValue
  } else {
    value = evaluate(Expressions.dereference(attribute.optimizer, combinationValues.map(Arrays.first)))
    const [_, modifierValues] = combinationValues.find((it) => value === Arrays.first(it)) ?? []
    winningModifiers = modifierValues!
    additionalInactiveModifiers = Arrays.differenceWith(
      activeModifiers,
      winningModifiers.map((it) => it.modifier),
      Equalitors.reference()
    )
  }

  return {
    value,
    initialValue,
    attribute,
    activeModifiers: winningModifiers,
    inactiveModifiers: [...inactiveModifiers, ...additionalInactiveModifiers],
  }
}
