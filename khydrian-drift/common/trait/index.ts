import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { Effect } from '@khydrian-drift/common/effect'
import { Preconditions, References } from '@khydrian-drift/util'
import { Class, ClassReference } from '@khydrian-drift/common/class'
import { Expression, Expressions } from '@khydrian-drift/util/expression'
import { CharacterOptions } from '@khydrian-drift/common/character'
import { ApplicationContext } from '@khydrian-drift/common/context'

export type TraitReference = Reference<'Trait'>

export type TraitProps = {
  name: string
  description: string
  prerequisites: Array<Expression<boolean>>
  effects: Array<Effect>
}

export type Trait = Referencable<TraitReference> & TraitProps & {}

export type TraitFilter = {
  specificOptions: Array<TraitReference>
}

export namespace TraitFilter {
  export const build = (props: Partial<TraitFilter>): TraitFilter => {
    return {
      specificOptions: props.specificOptions ?? [],
    }
  }

  export const Any: TraitFilter = build({})
}

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
    Preconditions.isPresent(matchingTrait, () => `Unable to find Trait for Reference: ${JSON.stringify(trait)}`)
    return matchingTrait
  })
}

export const getEffects = (traits: Array<Trait>): Array<Effect> => {
  const effects = traits.flatMap((trait) =>
    trait.effects.map((effect) => {
      const sourcedEffect: Effect = { ...effect, source: trait.reference }
      return sourcedEffect
    })
  )
  return effects
}

export const classPrerequisite = (clazz: ClassReference | Class): Expression<boolean> => {
  return Expressions.contains(CharacterOptions.Classes, [References.getReference(clazz)])
}

export const traitPrerequisite = (trait: TraitReference | Trait): Expression<boolean> => {
  return Expressions.contains(CharacterOptions.Traits, [References.getReference(trait)])
}
