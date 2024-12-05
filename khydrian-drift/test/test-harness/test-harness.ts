import { ApplicationContext } from '@khydrian-drift/common/context'
import { Dnd5e } from '@khydrian-drift/rulesets/dnd-5e'
import { CharacterBlueprint } from '@khydrian-drift/common/character/character'
import { ProgressionTables } from '@khydrian-drift/common'

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
  selections: ProgressionTables.empty(1),
}

export const CommonerLevel3: CharacterBlueprint = {
  name: 'Bob the Commoner',
  level: 3,
  baseAttributes: {
    brawn: 0,
    agility: 0,
    willpower: 0,
    intelligence: 0,
    presence: 0,
  },
  selections: ProgressionTables.empty(3),
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
