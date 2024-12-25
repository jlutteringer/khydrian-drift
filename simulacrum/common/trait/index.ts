import { Effect } from '@simulacrum/common/effect'
import { Archetype, ArchetypeReference } from '@simulacrum/common/archetype'
import { CharacterValues } from '@simulacrum/common/character/character'
import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { Expression, Expressions } from '@bessemer/cornerstone/expression'
import { Arrays, Preconditions, References } from '@bessemer/cornerstone'
import { ApplicationContext } from '@simulacrum/common/application'

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

export const defineTrait = (reference: ReferenceType<TraitReference>, props: TraitProps): Trait => {
  return {
    reference: References.reference(reference, 'Trait', props.name),
    ...props,
    archetypes: (props.archetypes ?? []).map(References.getReference),
    prerequisites: props.prerequisites ?? [],
  }
}

export const getTrait = (trait: TraitReference, context: ApplicationContext): Trait => {
  const matchingTrait = context.ruleset.traits.find((it) => References.equals(it.reference, trait))
  Preconditions.isPresent(matchingTrait, () => `Unable to find Trait for Reference: ${JSON.stringify(trait)}`)
  return matchingTrait
}

export const getTraits = (traits: Array<TraitReference>, context: ApplicationContext): Array<Trait> => {
  return traits.map((trait) => getTrait(trait, context))
}

export const traitPrerequisite = (trait: TraitReference | Trait): Expression<boolean> => {
  return Expressions.contains(CharacterValues.Traits, [References.getReference(trait)])
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

export const applyFilter = (traits: Array<Trait>, filter: TraitFilter): Array<Trait> => {
  let filteredTraits = traits
  if (!Arrays.isEmpty(filter.archetypes)) {
    filteredTraits = filteredTraits.filter((it) => Arrays.containsAllWith(filter.archetypes, it.archetypes, References.equalitor()))
  }
  if (!Arrays.isEmpty(filter.specificOptions)) {
    filteredTraits = filteredTraits.filter((it) => Arrays.containsWith(filter.specificOptions, it.reference, References.equalitor()))
  }

  return filteredTraits
}
