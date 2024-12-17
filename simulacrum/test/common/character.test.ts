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

  expect(character.characteristics.strength.value).toBe(16)
  expect(character.characteristics.strengthModifier.value).toBe(3)

  expect(character.characteristics.dexterity.value).toBe(14)
  expect(character.characteristics.dexterityModifier.value).toBe(2)

  expect(character.characteristics.constitution.value).toBe(15)
  expect(character.characteristics.constitutionModifier.value).toBe(2)

  expect(character.characteristics.wisdom.value).toBe(11)
  expect(character.characteristics.wisdomModifier.value).toBe(0)

  expect(character.characteristics.intelligence.value).toBe(12)
  expect(character.characteristics.intelligenceModifier.value).toBe(1)

  expect(character.characteristics.charisma.value).toBe(8)
  expect(character.characteristics.charismaModifier.value).toBe(-1)

  expect(character.characteristics.movementSpeed.value).toBe(30)
  expect(character.characteristics.initiative.value).toBe(2)

  expect(character.abilities.length).toBe(4)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter), context)
  expect(CharacterOptions.isSelected(character.selections, SelectClassLevel, Fighter)).toBe(true)

  expect(character.abilities.length).toBe(5)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectFightingStyle, Archery), context)
  expect(CharacterOptions.isSelected(character.selections, SelectFightingStyle, Archery)).toBe(true)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter2), context)
  expect(CharacterOptions.isSelected(character.selections, SelectClassLevel, Fighter2)).toBe(true)

  expect(character.abilities.length).toBe(6)

  character = Characters.selectOption(character, CharacterOptions.buildSelection(SelectClassLevel, Fighter3), context)
  expect(CharacterOptions.isSelected(character.selections, SelectClassLevel, Fighter3)).toBe(true)

  expect(character.characteristics.hitPoints.value).toBe(28)
  expect(character.resources.hitPoints.value).toBe(28)
})
