import { Attribute, AttributeTemplate } from '@simulacrum/common/attribute'
import { Attributes } from '@simulacrum/common'
import { NumericExpressions } from '@simulacrum/util/expression'
import { CharacterValues } from '@simulacrum/common/character/character'

export namespace AttributeTemplates {
  export const VitalityPool: AttributeTemplate<number> = Attributes.defineTemplate('5a6398ce-a77e-482d-b24c-4aed792230d7', 'Vitality Pool', 'vitalityPool')
  export const Initiative: AttributeTemplate<number> = Attributes.defineTemplate('c895b7ee-49c6-4e3e-82ac-83c5562132a6', 'Initiative', 'initiative')
  export const MovementSpeed: AttributeTemplate<number> = Attributes.defineTemplate('cab42a9c-e07a-489b-a36d-2bcb52163dad', 'Movement Speed', 'movementSpeed')
}

export namespace CreatureAttributes {
  export const VitalityPool: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.VitalityPool,
    initialValue: true,
  })

  export const Initiative: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.Initiative,
    initialValue: true,
  })

  export const MovementSpeed: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.Initiative,
    initialValue: true,
  })
}

export namespace CharacterAttributes {
  export const Brawn: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('efa1484a-1fd5-4224-ac42-7cbad79af90a', 'Strength', 'strength'),
    initialValue: true,
  })

  export const Agility: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('1959d7a0-c49e-4323-be59-538578c83f8e', 'Agility', 'agility'),
    initialValue: true,
  })

  export const Willpower: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('85a528bb-c1e9-45ea-9ab0-ecf7420d87b8', 'Wisdom', 'wisdom'),
    initialValue: true,
  })

  export const Intelligence: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('23e5a5de-b7fb-43e7-9363-27504a6b9fc0', 'Intelligence', 'intelligence'),
    initialValue: true,
  })

  export const Presence: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('f213fad6-8c4f-4e01-891c-e9d4da079e72', 'Charisma', 'charisma'),
    initialValue: true,
  })

  export const VitalityPool: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.VitalityPool,
    base: NumericExpressions.sum([10, NumericExpressions.multiply([CharacterValues.Level, 5])]),
  })

  export const Initiative: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.Initiative,
    base: Agility.variable,
  })

  export const MovementSpeed: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.MovementSpeed,
    base: 4,
  })
}