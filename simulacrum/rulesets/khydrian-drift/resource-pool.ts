import { ResourcePools } from '@simulacrum/common'
import { NumericExpressions } from '@simulacrum/util/expression'
import { TimeUnit } from '@simulacrum/common/types'
import { PlayerCharacteristics } from '@simulacrum/rulesets/khydrian-drift/characteristic'

export const TacticPoints = ResourcePools.defineResourcePool('4adb98e2-9409-4177-abf9-1cbd1e9fb5ee', {
  name: 'Tactic Points',
  description: '',
  resourcePool: {
    size: NumericExpressions.floor(PlayerCharacteristics.Presence.variable, 1),
    refresh: [
      {
        period: TimeUnit.LongRest,
        amount: NumericExpressions.floor(PlayerCharacteristics.Presence.variable, 1),
      },
    ],
  },
})
