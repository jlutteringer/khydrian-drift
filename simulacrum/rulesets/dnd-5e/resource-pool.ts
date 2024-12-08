import { ResourcePools } from '@simulacrum/common'
import { TimeUnit } from '@simulacrum/common/types'
import { CharacterAttributes } from '@simulacrum/rulesets/dnd-5e/attributes'

export const HitPointResourcePool = ResourcePools.defineResourcePool('fb71d133-cfcf-46fe-b68f-2c3262df7cd7', {
  name: 'Hit Points',
  description: '',
  size: CharacterAttributes.HitPoints.variable,
  refresh: {
    period: TimeUnit.LongRest,
    amount: CharacterAttributes.HitPoints.variable,
  },
})
