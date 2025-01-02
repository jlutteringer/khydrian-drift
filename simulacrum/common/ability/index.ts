import { LoadoutTypeReference } from '@simulacrum/common/loadout'
import { Effect, EffectSourceType } from '@simulacrum/common/effect'
import { ResourceCost } from '@simulacrum/common/resource-pool'
import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { Expression } from '@bessemer/cornerstone/expression'
import { Preconditions, References } from '@bessemer/cornerstone'
import { ApplicationContext } from '@simulacrum/common/application'

export enum ActionType {
  Free = 'Free',
  Bonus = 'Bonus',
  Standard = 'Standard',
  Reaction = 'Reaction',
}

export type AbilityReference = Reference<'Ability'>

export type Ability = Referencable<AbilityReference> & {
  name: string
  description: string

  prerequisites: Array<Expression<boolean>>
  loadout: LoadoutTypeReference | null

  effects: Array<Effect>
  actions: Array<AbilityAction>
  costs: Array<ResourceCost>
}

export type AbilityAction = {
  name: string | null
  description: string | null

  action: ActionType
  costs: Array<ResourceCost>
}

export type AbilityProps = {
  name: string
  description: string

  prerequisites?: Array<Expression<boolean>>
  loadout?: LoadoutTypeReference

  effects?: Array<Effect>
  actions: Array<{
    name?: string
    description?: string
    action: ActionType

    costs?: Array<ResourceCost>
  }>

  costs?: Array<ResourceCost>
}

export type AbilityState = {
  ability: Ability
}

export const defineAbility = (reference: ReferenceType<AbilityReference>, props: AbilityProps): Ability => {
  return {
    reference: References.reference(reference, 'Ability', props.name),
    name: props.name,
    description: props.description,
    prerequisites: props.prerequisites ?? [],
    loadout: props.loadout ?? null,
    effects: props.effects ?? [],
    actions: props.actions.map((it) => ({
      name: it.name ?? null,
      description: it.description ?? null,
      action: it.action,
      costs: it.costs ?? [],
    })),
    costs: props.costs ?? [],
  }
}

export const getAbility = (reference: AbilityReference, context: ApplicationContext): Ability => {
  const ability = context.client.ruleset.abilities.find((it) => References.equals(it.reference, reference))
  Preconditions.isPresent(ability)
  return ability
}

export const getAbilities = (abilities: Array<AbilityReference>, context: ApplicationContext): Array<Ability> => {
  return abilities.map((it) => getAbility(it, context))
}

export const getEffectsForAbility = (ability: Ability): Array<Effect> => {
  return ability.effects.map((effect) => {
    const sourcedEffect: Effect = { ...effect, source: { type: EffectSourceType.Ability, ability: ability.reference } }
    return sourcedEffect
  })
}

// JOHN
export const buildInitialState = (ability: AbilityReference, context: ApplicationContext): AbilityState => {
  return { ability: getAbility(ability, context) }
}
