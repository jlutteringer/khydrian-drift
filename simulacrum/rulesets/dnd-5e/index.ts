import { Ruleset } from '@simulacrum/common/ruleset'
import { References } from '@simulacrum/util'
import { Effects } from '@simulacrum/common'
import {
  BattleMaster,
  Champion,
  EldritchKnight,
  Fighter,
  Fighter2,
  Fighter3,
  PsiWarrior
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
import { CharacterAttributes, CreatureAttributes } from '@simulacrum/rulesets/dnd-5e/attributes'

export const SelectClassLevel = CharacterOptions.selectTraitOption('afbef236-17a0-464f-b2d0-cb01ecf7931a', { archetypes: [Class] })

export const Dnd5e: Ruleset = {
  reference: References.reference('ca894259-d62d-4398-b417-cb4f0adf4ffe', 'Ruleset', 'Dungeons and Dragons 5e'),
  name: 'Dungeons and Dragons 5e',
  creatureAttributes: Object.values(CreatureAttributes),
  characterAttributes: Object.values(CharacterAttributes),
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
  resourcePools: [],
  loadoutTypes: [],
  progressionTable: {
    1: [Effects.gainCharacterOption(SelectClassLevel)],
    2: [Effects.gainCharacterOption(SelectClassLevel)],
    3: [Effects.gainCharacterOption(SelectClassLevel)],
  },
}
