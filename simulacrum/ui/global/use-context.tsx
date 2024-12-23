import { ApplicationContext } from '@simulacrum/common/context'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'

export const useBrowseContext = (): ApplicationContext => {
  return { ruleset: Dnd5e }
}
