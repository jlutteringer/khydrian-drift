import { ResourcePools } from '@simulacrum/common'
import { NumericExpressions } from '@simulacrum/util/expression'
import { TimeUnit } from '@simulacrum/common/types'
import { CharacterAttributes } from '@simulacrum/rulesets/khydrian-drift/attributes'

export const TacticPoints = ResourcePools.defineResourcePool('4adb98e2-9409-4177-abf9-1cbd1e9fb5ee', {
  name: 'Tactic Points',
  description: '',
  size: NumericExpressions.floor(CharacterAttributes.Presence.variable, 1),
  refresh: {
    period: TimeUnit.LongRest,
    amount: NumericExpressions.floor(CharacterAttributes.Presence.variable, 1),
  },
})
