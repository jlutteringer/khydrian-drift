import { LoadoutTypeReference } from '@simulacrum/common/loadout'
import { Expression } from '@simulacrum/util/expression'
import { Effect } from '@simulacrum/common/effect'
import { Referencable, Reference } from '@simulacrum/util/reference'
import { Arrays, References } from '@simulacrum/util'
import { ApplicationContext } from '@simulacrum/common/context'
import { ResourceCost } from '@simulacrum/common/resource-pool'

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
  ability: AbilityReference
}

export const defineAbility = (reference: AbilityReference | string, props: AbilityProps): Ability => {
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

export const getAbilities = (abilities: Array<AbilityReference>, context: ApplicationContext): Array<Ability> => {
  return context.ruleset.abilities.filter((ability) => Arrays.contains(abilities, ability.reference))
}

export const getEffectsForAbility = (ability: Ability): Array<Effect> => {
  return ability.effects.map((effect) => {
    const sourcedEffect: Effect = { ...effect, source: ability.reference }
    return sourcedEffect
  })
}

export const buildAbilityState = (ability: AbilityReference): AbilityState => {
  return {
    ability,
  }
}
