import { TestHarness } from '@simulacrum/test/test-harness'
import { CharacterOptions, Characters } from '@simulacrum/common/character'
import { SelectClassLevel } from '@simulacrum/rulesets/dnd-5e'
import { Fighter, Fighter2, Fighter3 } from '@simulacrum/rulesets/dnd-5e/class/class-fighter'
import { Archery, SelectFightingStyle } from '@simulacrum/rulesets/dnd-5e/archetype/fighting-style'

test('Test Character Choices and Selections', () => {
  const context = TestHarness.buildTestContext()
  let character = Characters.buildCharacterDefinition(TestHarness.CommonerLevel3, context)

  // We should have one class choice at level one with 12 options for the 12 classes
  expect(character.choices[1].length).toBe(1)
  expect(character.choices[1][0].values.length).toBe(12)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter), context)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectFightingStyle, Archery), context)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter2), context)
  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter3), context)
  console.log(character.selections)
})
