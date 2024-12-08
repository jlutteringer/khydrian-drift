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

  expect(character.attributes.strength.value).toBe(16)
  expect(character.attributes.strengthModifier.value).toBe(3)

  expect(character.attributes.dexterity.value).toBe(14)
  expect(character.attributes.dexterityModifier.value).toBe(2)

  expect(character.attributes.constitution.value).toBe(15)
  expect(character.attributes.constitutionModifier.value).toBe(2)

  expect(character.attributes.wisdom.value).toBe(11)
  expect(character.attributes.wisdomModifier.value).toBe(0)

  expect(character.attributes.intelligence.value).toBe(12)
  expect(character.attributes.intelligenceModifier.value).toBe(1)

  expect(character.attributes.charisma.value).toBe(8)
  expect(character.attributes.charismaModifier.value).toBe(-1)

  expect(character.attributes.movementSpeed.value).toBe(30)
  expect(character.attributes.initiative.value).toBe(2)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter), context)
  expect(CharacterOptions.isSelected(character.selections, SelectClassLevel, Fighter)).toBe(true)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectFightingStyle, Archery), context)
  expect(CharacterOptions.isSelected(character.selections, SelectFightingStyle, Archery)).toBe(true)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter2), context)
  expect(CharacterOptions.isSelected(character.selections, SelectClassLevel, Fighter2)).toBe(true)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter3), context)
  expect(CharacterOptions.isSelected(character.selections, SelectClassLevel, Fighter3)).toBe(true)

  expect(character.attributes.hitPoints.value).toBe(28)
})
