import { ResourcePools } from '@khydrian-drift/common'
import { CharacterProperties } from '@khydrian-drift/common/character'
import { TimeUnit } from '@khydrian-drift/common/types'
import { NumericExpressions } from '@khydrian-drift/util/expression'

export const TacticPoints = ResourcePools.defineResourcePool({
  name: 'Tactic Points',
  description: '',
  size: NumericExpressions.min(CharacterProperties.Presence, 1),
  refresh: {
    period: TimeUnit.LongRest,
    amount: NumericExpressions.min(CharacterProperties.Presence, 1),
  },
})
