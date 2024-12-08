import { Cooldown } from '@simulacrum/common/types'
import { LoadoutTypeReference } from '@simulacrum/common/loadout'
import { Expression } from '@simulacrum/util/expression'
import { Effect } from '@simulacrum/common/effect'
import { Referencable, Reference } from '@simulacrum/util/reference'
import { References } from '@simulacrum/util'

export enum ActionType {
  Free = 'Free',
  Bonus = 'Bonus',
  Action = 'Action',
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

  cooldown: Cooldown | null
}

export type AbilityAction = {
  name: string
  description: string

  action: ActionType

  cost: number
  cooldown: Cooldown | null
}

export type AbilityProps = {
  name: string
  description: string

  prerequisites?: Array<Expression<boolean>>
  loadout?: LoadoutTypeReference

  effects?: Array<Effect>
  actions: Array<{
    name: string
    description: string
    action: ActionType

    cost?: number
    cooldown?: Cooldown
  }>

  cooldown?: Cooldown
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
      name: it.name,
      description: it.description,
      action: it.action,
      cost: it.cost ?? 1,
      cooldown: it.cooldown ?? 'None',
    })),
    cooldown: props.cooldown ?? 'None',
  }
}
