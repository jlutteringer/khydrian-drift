import { CharacterValues } from '@simulacrum/common/character/character'
import { Characteristics } from '@simulacrum/common'
import { Characteristic, CharacteristicTemplate } from '@simulacrum/common/characteristic'
import { NumericExpressions } from '@bessemer/cornerstone/expression'
import { RoundingMode } from '@bessemer/cornerstone/math'
import { ObjectPaths } from '@bessemer/cornerstone'

export namespace CharacteristicTemplates {
  export const HitPoints: CharacteristicTemplate<number> = Characteristics.defineTemplate(
    '60cddec2-2b04-4a8e-92c4-2566b050989e',
    'Hit Points',
    ObjectPaths.of('hitPoints')
  )
  export const ArmorClass: CharacteristicTemplate<number> = Characteristics.defineTemplate(
    'ad8df36f-2960-4c7a-aac5-b4c36443de76',
    'Armor Class',
    ObjectPaths.of('armorClass')
  )
  export const Initiative: CharacteristicTemplate<number> = Characteristics.defineTemplate(
    '83212edc-bc06-4f1c-939a-d700cca5e4bb',
    'Initiative',
    ObjectPaths.of('initiative')
  )
  export const MovementSpeed: CharacteristicTemplate<number> = Characteristics.defineTemplate(
    '435e3aaa-b16b-434d-964c-6b1fd36591a8',
    'Movement Speed',
    ObjectPaths.of('movementSpeed')
  )
}

export namespace CreatureCharacteristics {
  export const HitPoints: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.HitPoints,
    initialValue: true,
  })

  export const ArmorClass: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.ArmorClass,
    initialValue: true,
  })

  export const Initiative: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.Initiative,
    initialValue: true,
  })

  export const MovementSpeed: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.Initiative,
    initialValue: true,
  })
}

export namespace PlayerCharacteristics {
  export const Strength: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('d5918660-631d-4235-9255-c5e3ffe12533', 'Strength', ObjectPaths.of('strength')),
    initialValue: true,
  })

  export const Dexterity: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('f99bd4b3-758e-4268-93be-79e4eb705996', 'Dexterity', ObjectPaths.of('dexterity')),
    initialValue: true,
  })

  export const Constitution: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('e6a76947-c31e-4d41-8598-baefc3b1e788', 'Constitution', ObjectPaths.of('constitution')),
    initialValue: true,
  })

  export const Wisdom: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('72e3dd16-6fb9-4498-8c29-60f489309819', 'Wisdom', ObjectPaths.of('wisdom')),
    initialValue: true,
  })

  export const Intelligence: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('e96116ef-9615-4edc-8c83-f0bcb38f5319', 'Intelligence', ObjectPaths.of('intelligence')),
    initialValue: true,
  })

  export const Charisma: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('799e5562-277d-4af6-9e61-add32c761ac6', 'Charisma', ObjectPaths.of('charisma')),
    initialValue: true,
  })

  export const StrengthModifier: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('ab339ba9-3ff2-4cc4-8bac-454078938c27', 'Strength Modifier', ObjectPaths.of('strengthModifier')),
    baseValue: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Strength.variable, -10]), 0.5]), 0, RoundingMode.Down),
  })

  export const DexterityModifier: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('ce1eaad3-8c00-4313-8e50-b7168246b223', 'Dexterity Modifier', ObjectPaths.of('dexterityModifier')),
    baseValue: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Dexterity.variable, -10]), 0.5]), 0, RoundingMode.Down),
  })

  export const ConstitutionModifier: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('5c25bfaa-0bbc-4482-aad6-951ff1fba801', 'Constitution Modifier', ObjectPaths.of('constitutionModifier')),
    baseValue: NumericExpressions.round(
      NumericExpressions.multiply([NumericExpressions.sum([Constitution.variable, -10]), 0.5]),
      0,
      RoundingMode.Down
    ),
  })

  export const WisdomModifier: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('3b60723b-f7f7-48f6-a747-0e72f14a59fa', 'Wisdom Modifier', ObjectPaths.of('wisdomModifier')),
    baseValue: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Wisdom.variable, -10]), 0.5]), 0, RoundingMode.Down),
  })

  export const IntelligenceModifier: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('054fdd7c-a274-4533-929c-3a0939468bb7', 'Intelligence Modifier', ObjectPaths.of('intelligenceModifier')),
    baseValue: NumericExpressions.round(
      NumericExpressions.multiply([NumericExpressions.sum([Intelligence.variable, -10]), 0.5]),
      0,
      RoundingMode.Down
    ),
  })

  export const CharismaModifier: Characteristic<number> = Characteristics.defineCharacteristic({
    template: Characteristics.defineTemplate('60f4ffa4-9486-4c23-8876-86b6a2ea5f30', 'Charisma Modifier', ObjectPaths.of('charismaModifier')),
    baseValue: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Charisma.variable, -10]), 0.5]), 0, RoundingMode.Down),
  })

  export const HitPoints: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.HitPoints,
    baseValue: NumericExpressions.multiply([CharacterValues.Level, ConstitutionModifier.variable]),
  })

  export const ArmorClass: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.ArmorClass,
    baseValue: NumericExpressions.sum([10, DexterityModifier.variable]),
  })

  export const Initiative: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.Initiative,
    baseValue: DexterityModifier.variable,
  })

  export const MovementSpeed: Characteristic<number> = Characteristics.defineCharacteristic({
    template: CharacteristicTemplates.MovementSpeed,
    baseValue: 30,
  })
}
