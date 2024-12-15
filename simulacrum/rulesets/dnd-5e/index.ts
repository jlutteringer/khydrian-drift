import { Ruleset } from '@simulacrum/common/ruleset'
import { References } from '@simulacrum/util'
import { Effects } from '@simulacrum/common'
import {
  ActionSurge,
  BattleMaster,
  Champion,
  EldritchKnight,
  Fighter,
  Fighter2,
  Fighter3,
  PsiWarrior,
  SecondWind,
} from '@simulacrum/rulesets/dnd-5e/class/class-fighter'
import { Archery, BlindFighting, Defense } from '@simulacrum/rulesets/dnd-5e/archetype/fighting-style'
import { Class } from '@simulacrum/rulesets/dnd-5e/archetype'
import { Barbarian } from '@simulacrum/rulesets/dnd-5e/class/class-barbarian'
import { CharacterOptions } from '@simulacrum/common/character'
import { Cleric } from '@simulacrum/rulesets/dnd-5e/class/class-cleric'
import { Druid } from '@simulacrum/rulesets/dnd-5e/class/class-druid'
import { Bard } from '@simulacrum/rulesets/dnd-5e/class/class-bard'
import { Monk } from '@simulacrum/rulesets/dnd-5e/class/class-monk'
import { Paladin } from '@simulacrum/rulesets/dnd-5e/class/class-paladin'
import { Ranger } from '@simulacrum/rulesets/dnd-5e/class/class-ranger'
import { Rogue } from '@simulacrum/rulesets/dnd-5e/class/class-rogue'
import { Sorcerer } from '@simulacrum/rulesets/dnd-5e/class/class-sorcerer'
import { Warlock } from '@simulacrum/rulesets/dnd-5e/class/class-warlock'
import { Wizard } from '@simulacrum/rulesets/dnd-5e/class/class-wizard'
import { CreatureCharacteristics, PlayerCharacteristics } from '@simulacrum/rulesets/dnd-5e/characteristic'
import { Dash, Disengage, Dodge, HealingSurge } from '@simulacrum/rulesets/dnd-5e/common'

export const SelectClassLevel = CharacterOptions.selectTraitOption('afbef236-17a0-464f-b2d0-cb01ecf7931a', { archetypes: [Class] })

export const Dnd5e: Ruleset = {
  reference: References.reference('ca894259-d62d-4398-b417-cb4f0adf4ffe', 'Ruleset', 'Dungeons and Dragons 5e'),
  name: 'Dungeons and Dragons 5e',
  creatureCharacteristics: Object.values(CreatureCharacteristics),
  playerCharacteristics: Object.values(PlayerCharacteristics),
  traits: [
    Barbarian,
    Bard,
    Cleric,
    Druid,
    Fighter,
    Monk,
    Paladin,
    Ranger,
    Rogue,
    Sorcerer,
    Warlock,
    Wizard,
    Archery,
    BlindFighting,
    Defense,
    Fighter2,
    Fighter3,
    BattleMaster,
    Champion,
    EldritchKnight,
    PsiWarrior,
  ],
  abilities: [Dodge, Disengage, Dash, HealingSurge, SecondWind, ActionSurge],
  resourcePools: [],
  loadoutTypes: [],
  progressionTable: {
    1: [
      Effects.gainCharacterOption(SelectClassLevel),
      Effects.gainAbility(Dodge),
      Effects.gainAbility(Disengage),
      Effects.gainAbility(Dash),
      Effects.gainAbility(HealingSurge),
    ],
    2: [Effects.gainCharacterOption(SelectClassLevel)],
    3: [Effects.gainCharacterOption(SelectClassLevel)],
  },
}
