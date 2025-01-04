import { CharacterOption, CharacterSelection } from '@simulacrum/common/character/character-option'
import { Effect, EffectSource, EffectSourceType } from '@simulacrum/common/effect'
import { TraitReference } from '@simulacrum/common/trait'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { Effects, ProgressionTables, Traits } from '@simulacrum/common'
import { CharacterSheet } from '@simulacrum/common/character/character'
import { Arrays, Objects, References } from '@bessemer/cornerstone'
import { CharacterOptions } from '@simulacrum/common/character/index'
import { ApplicationContext } from '@simulacrum/common/application'

export type CharacterEffectSource = { type: EffectSourceType.Ruleset } | { type: EffectSourceType.Trait; trait: TraitReference }

export type CharacterProgressionEntry = {
  key: string
  source: CharacterEffectSource
  option: CharacterOption | null
  selection: CharacterSelection | null
  effects: Array<Effect>

  // TODO
  // modifiers: Array<ModifierValue<unknown>>
}

export const buildEffectsTable = (character: CharacterSheet, context: ApplicationContext): ProgressionTable<Effect> => {
  return ProgressionTables.flatMap(buildProgressionTable(character, context), (it) => it.effects)
}

export const buildProgressionTable = (character: CharacterSheet, context: ApplicationContext): ProgressionTable<CharacterProgressionEntry> => {
  const rulesetEffects = ProgressionTables.capAtLevel(context.client.ruleset.progressionTable, character.level)
  const source: CharacterEffectSource = { type: EffectSourceType.Ruleset }
  const characterProgressionTable = ProgressionTables.mapRows(rulesetEffects, (effects, level) => {
    const [levelUpEffects, additionalEntries] = buildCharacterProgressionEntries(effects, source, character, level, context)
    const levelUpEntries = !Arrays.isEmpty(levelUpEffects)
      ? [
          {
            key: getKey(null, level),
            source,
            option: null,
            selection: null,
            effects: levelUpEffects,
          },
        ]
      : []

    return [...levelUpEntries, ...additionalEntries]
  })

  return characterProgressionTable
}

const buildCharacterProgressionEntries = (
  initialEffects: Array<Effect>,
  source: CharacterEffectSource,
  character: CharacterSheet,
  level: number,
  context: ApplicationContext
): [Array<Effect>, Array<CharacterProgressionEntry>] => {
  const effects = Effects.sourceEffects(initialEffects, source)
  const optionEffects = Effects.filter(effects, Effects.GainCharacterOption)

  const additionalEntries = optionEffects.flatMap((optionEffect) => {
    const selection = CharacterOptions.getSelection(character.selections, optionEffect.option, level)

    if (Objects.isPresent(selection)) {
      const trait = Traits.getTrait(selection.selection, context)
      const traitSource: EffectSource = { type: EffectSourceType.Trait, trait: References.getReference(trait) }
      const [traitEffects, additionalEntries] = buildCharacterProgressionEntries(trait.effects, traitSource, character, level, context)

      const traitEntries = !Arrays.isEmpty(traitEffects)
        ? [
            {
              key: getKey(optionEffect.option, level),
              source,
              option: optionEffect.option,
              selection: selection,
              effects: traitEffects,
            },
          ]
        : []

      return [...traitEntries, ...additionalEntries]
    } else {
      return [
        {
          key: getKey(optionEffect.option, level),
          source,
          option: optionEffect.option,
          selection: null,
          effects: [],
        },
      ]
    }
  })

  return [effects, additionalEntries]
}

const getKey = (option: CharacterOption | null, level: number): string => {
  return `${option?.reference.id}-${level}`
}
