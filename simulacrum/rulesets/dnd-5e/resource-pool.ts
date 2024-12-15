import { ResourcePools } from '@simulacrum/common'
import { TimeUnit } from '@simulacrum/common/types'
import { PlayerCharacteristics } from '@simulacrum/rulesets/dnd-5e/characteristic'

export const HitPointResourcePool = ResourcePools.defineResourcePool('fb71d133-cfcf-46fe-b68f-2c3262df7cd7', {
  name: 'Hit Points',
  description: '',
  resourcePool: {
    size: PlayerCharacteristics.HitPoints.variable,
    refresh: [{ period: TimeUnit.LongRest, amount: PlayerCharacteristics.HitPoints.variable }],
  },
})
