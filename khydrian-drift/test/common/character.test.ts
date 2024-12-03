import { Characters } from '@khydrian-drift/common'
import { TestHarness } from '@khydrian-drift/test/test-harness'
import { Level1ClassOption } from '@khydrian-drift/rulesets/dnd-5e'
import { Fighter } from '@khydrian-drift/rulesets/dnd-5e/class/class-fighter'

test('Test Commoner Level ', () => {
  const result = Characters.buildCharacterDefinition(TestHarness.CommonerLevel1, TestHarness.buildTestContext())
  expect(result.options.length).toBeGreaterThan(1)

  const blah = Characters.selectOption(TestHarness.CommonerLevel1, Level1ClassOption, Fighter)
})
