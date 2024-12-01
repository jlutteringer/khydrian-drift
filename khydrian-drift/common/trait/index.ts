import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { Effect, EffectType, EvaluateEffectsResponse } from '@khydrian-drift/common/effect'
import { Preconditions, References } from '@khydrian-drift/util'
import { ClassReference } from '@khydrian-drift/common/class'
import { Expression, ExpressionContext, Expressions } from '@khydrian-drift/util/expression'
import { CharacterProperties } from '@khydrian-drift/common/character'
import { ApplicationContext } from '@khydrian-drift/common/context'
import { Effects } from '@khydrian-drift/common'

export type TraitReference = Reference<'Trait'>

export type TraitProps = {
  name: string
  description: string
  prerequisites: Array<Expression<boolean>>
  effects: Array<Effect>
}

export type Trait = Referencable<TraitReference> & TraitProps & {}

export const reference = (id: string, name: string): TraitReference => {
  return References.reference(id, 'Trait', name)
}

export const defineTrait = (reference: TraitReference | string, props: TraitProps): Trait => {
  return {
    reference: References.reference(reference, 'Trait', props.name),
    ...props,
  }
}

export const getTraits = (traits: Array<TraitReference>, context: ApplicationContext): Array<Trait> => {
  return traits.map((trait) => {
    const matchingTrait = context.ruleset.traits.find((it) => it.reference.id === trait.id)
    Preconditions.isPresent(matchingTrait)
    return matchingTrait
  })
}

export const evaluateEffects = <T extends Effect>(traits: Array<Trait>, type: EffectType<T>, context: ExpressionContext): EvaluateEffectsResponse<T> => {
  return Effects.evaluateEffects(
    traits.flatMap((it) => it.effects),
    type,
    context
  )
}

export const classPrerequisite = (clazz: ClassReference): Expression<boolean> => {
  return Expressions.contains(CharacterProperties.Classes, [clazz])
}

export const traitPrerequisite = (trait: TraitReference): Expression<boolean> => {
  return Expressions.contains(CharacterProperties.Traits, [trait.id])
}
