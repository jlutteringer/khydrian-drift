import { ResourcePools } from '@khydrian-drift/common'
import { NumericExpressions } from '@khydrian-drift/util/expression'
import { CharacterAttributes } from '@khydrian-drift/common/character'
import { TimeUnit } from '@khydrian-drift/common/types'

export const TacticPoints = ResourcePools.defineResourcePool('4adb98e2-9409-4177-abf9-1cbd1e9fb5ee', {
  name: 'Tactic Points',
  description: '',
  size: NumericExpressions.floor(CharacterAttributes.Presence.variable, 1),
  refresh: {
    period: TimeUnit.LongRest,
    amount: NumericExpressions.floor(CharacterAttributes.Presence.variable, 1),
  },
})
