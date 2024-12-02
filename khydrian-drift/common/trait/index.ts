import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { Effect } from '@khydrian-drift/common/effect'
import { Preconditions, References } from '@khydrian-drift/util'
import { Expression, Expressions } from '@khydrian-drift/util/expression'
import { CharacterOptions } from '@khydrian-drift/common/character'
import { ApplicationContext } from '@khydrian-drift/common/context'
import { Archetype, ArchetypeReference } from '@khydrian-drift/common/archetype'

export type TraitReference = Reference<'Trait'>

export type TraitProps = {
  name: string
  description: string
  effects: Array<Effect>

  archetypes?: Array<ArchetypeReference | Archetype>
  prerequisites?: Array<Expression<boolean>>
}

export type Trait = Referencable<TraitReference> & {
  name: string
  description: string
  effects: Array<Effect>

  archetypes: Array<ArchetypeReference>
  prerequisites: Array<Expression<boolean>>
}

export const reference = (id: string, name: string): TraitReference => {
  return References.reference(id, 'Trait', name)
}

export const defineTrait = (reference: TraitReference | string, props: TraitProps): Trait => {
  return {
    reference: References.reference(reference, 'Trait', props.name),
    ...props,
    archetypes: (props.archetypes ?? []).map(References.getReference),
    prerequisites: props.prerequisites ?? [],
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

export const traitPrerequisite = (trait: TraitReference | Trait): Expression<boolean> => {
  return Expressions.contains(CharacterOptions.Traits, [References.getReference(trait)])
}

export type TraitFilterProps = {
  archetypes?: Array<ArchetypeReference | Archetype>
  specificOptions?: Array<TraitReference | Trait>
}

export type TraitFilter = {
  archetypes: Array<ArchetypeReference>
  specificOptions: Array<TraitReference>
}

export const filter = (props: TraitFilterProps): TraitFilter => {
  return {
    archetypes: (props.archetypes ?? []).map(References.getReference),
    specificOptions: (props.specificOptions ?? []).map(References.getReference),
  }
}

export const filterNone = (): TraitFilter => {
  return filter({})
}
