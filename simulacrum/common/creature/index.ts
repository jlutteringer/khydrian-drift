import { AttributeValue } from '@simulacrum/common/attribute'

export type CreatureSchema = {

}

export type CreatureAttributes = {
  vitalityPool: AttributeValue<number>
  soakRating: AttributeValue<number>
  movementSpeed: AttributeValue<number>
  initiative: AttributeValue<number>
}

export type CreatureState = {
  vitalityPoints: number
  soakPoints: number
}
