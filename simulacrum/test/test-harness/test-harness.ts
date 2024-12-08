import { ApplicationContext } from '@simulacrum/common/context'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'
import { CharacterRecord } from '@simulacrum/common/character/character'
import { ProgressionTables } from '@simulacrum/common'

export const buildTestContext = (): ApplicationContext => {
  return { ruleset: Dnd5e }
}

export const CommonerLevel1: CharacterRecord = {
  name: 'Bob the Commoner',
  level: 1,
  initialValues: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    wisdom: 11,
    intelligence: 12,
    charisma: 8,
  },
  selections: ProgressionTables.empty(1),
}

export const CommonerLevel3: CharacterRecord = {
  name: 'Bob the Commoner',
  level: 3,
  initialValues: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    wisdom: 11,
    intelligence: 12,
    charisma: 8,
  },
  selections: ProgressionTables.empty(3),
}

export const FighterLevel2: CharacterRecord = {
  name: 'Bob the Fighter',
  level: 2,
  initialValues: {
    strength: 16,
    dexterity: 14,
    constitution: 15,
    wisdom: 11,
    intelligence: 12,
    charisma: 8,
  },
  selections: [],
}
