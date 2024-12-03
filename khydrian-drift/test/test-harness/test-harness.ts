import { ApplicationContext } from '@khydrian-drift/common/context'
import { CharacterBlueprint } from '@khydrian-drift/common/character'
import { Dnd5e } from '@khydrian-drift/rulesets/dnd-5e'

export const buildTestContext = (): ApplicationContext => {
  return { ruleset: Dnd5e }
}

export const CommonerLevel1: CharacterBlueprint = {
  name: 'Bob the Commoner',
  level: 1,
  baseAttributes: {
    brawn: 2,
    agility: 2,
    willpower: 0,
    intelligence: 0,
    presence: 0,
  },
  selections: [],
}

export const CharacterLevel2: CharacterBlueprint = {
  name: 'Bob the Fighter',
  level: 2,
  baseAttributes: {
    brawn: 2,
    agility: 2,
    willpower: 0,
    intelligence: 0,
    presence: 0,
  },
  selections: [],
}

export const FighterLevel2: CharacterBlueprint = {
  name: 'Bob the Fighter',
  level: 2,
  baseAttributes: {
    brawn: 2,
    agility: 2,
    willpower: 0,
    intelligence: 0,
    presence: 0,
  },
  selections: [],
}
