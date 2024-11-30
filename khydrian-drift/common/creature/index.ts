export enum CreatureValue {
  VitalityPoints = 'VitalityPoints',
}

export type CreatureDefinition = {
  vitalityPool: number
  soakRating: number
  movementSpeed: number
  initiative: number
}

export type CreatureState = {
  vitalityPoints: number
  soakPoints: number
}
