import { AttributeValue } from '@khydrian-drift/common/attribute'

export type CreatureDefinition = {
  vitalityPool: AttributeValue<number>
  soakRating: AttributeValue<number>
  movementSpeed: AttributeValue<number>
  initiative: AttributeValue<number>
}

export type CreatureState = {
  vitalityPoints: number
  soakPoints: number
}
