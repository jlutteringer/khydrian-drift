import { Characteristics } from '@simulacrum/common'
import { NumericExpressions } from '@simulacrum/util/expression'
import { CharacterValues } from '@simulacrum/common/character/character'
import { Characteristic, CharacteristicTemplate } from '@simulacrum/common/characteristic'

export namespace CharacteristicTemplates {
  export const VitalityPool: CharacteristicTemplate<number> = Characteristics.defineTemplate(
    '5a6398ce-a77e-482d-b24c-4aed792230d7',
    'Vitality Pool',
    'vitalityPool'
  )
  export const Initiative: CharacteristicTemplate<number> = Characteristics.defineTemplate('c895b7ee-49c6-4e3e-82ac-83c5562132a6', 'Initiative', 'initiative')
  export const MovementSpeed: CharacteristicTemplate<number> = Characteristics.defineTemplate(
    'cab42a9c-e07a-489b-a36d-2bcb52163dad',
    'Movement Speed',
    'movementSpeed'
  )
}

export namespace CreatureCharacteristics {
  export const VitalityPool: Characteristic<number> = Characteristics.defineCharacteristic<number>({
    template: CharacteristicTemplates.VitalityPool,
    initialValue: true,
  })

  export const Initiative: Characteristic<number> = Characteristics.defineCharacteristic<number>({
    template: CharacteristicTemplates.Initiative,
    initialValue: true,
  })

  export const MovementSpeed: Characteristic<number> = Characteristics.defineCharacteristic<number>({
    template: CharacteristicTemplates.Initiative,
    initialValue: true,
  })
}

export namespace PlayerCharacteristics {
  export const Brawn: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('efa1484a-1fd5-4224-ac42-7cbad79af90a', 'Strength', 'strength'),
    initialValue: true,
  })

  export const Agility: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('1959d7a0-c49e-4323-be59-538578c83f8e', 'Agility', 'agility'),
    initialValue: true,
  })

  export const Willpower: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('85a528bb-c1e9-45ea-9ab0-ecf7420d87b8', 'Wisdom', 'wisdom'),
    initialValue: true,
  })

  export const Intelligence: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('23e5a5de-b7fb-43e7-9363-27504a6b9fc0', 'Intelligence', 'intelligence'),
    initialValue: true,
  })

  export const Presence: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('f213fad6-8c4f-4e01-891c-e9d4da079e72', 'Charisma', 'charisma'),
    initialValue: true,
  })

  export const VitalityPool: Characteristic<number> = Characteristics.defineCharacteristic<number>({
    template: CharacteristicTemplates.VitalityPool,
    baseValue: NumericExpressions.sum([10, NumericExpressions.multiply([CharacterValues.Level, 5])]),
  })

  export const Initiative: Characteristic<number> = Characteristics.defineCharacteristic<number>({
    template: CharacteristicTemplates.Initiative,
    baseValue: Agility.variable,
  })

  export const MovementSpeed: Characteristic<number> = Characteristics.defineCharacteristic<number>({
    template: CharacteristicTemplates.MovementSpeed,
    baseValue: 4,
  })
}
