import { AttributeValue } from '@khydrian-drift/common/attribute'

export type CreatureDefinition = {
  vitalityPool: number
  soakRating: number
  movementSpeed: AttributeValue<number>
  initiative: number
}

export type CreatureState = {
  vitalityPoints: number
  soakPoints: number
}
