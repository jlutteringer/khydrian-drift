import { Attribute, AttributeTemplate } from '@simulacrum/common/attribute'
import { Attributes } from '@simulacrum/common'
import { NumericExpressions } from '@simulacrum/util/expression'
import { CharacterValues } from '@simulacrum/common/character/character'
import { RoundingMode } from '@simulacrum/util/math'

export namespace AttributeTemplates {
  export const HitPoints: AttributeTemplate<number> = Attributes.defineTemplate('60cddec2-2b04-4a8e-92c4-2566b050989e', 'Hit Points', 'hitPoints')
  export const Initiative: AttributeTemplate<number> = Attributes.defineTemplate('83212edc-bc06-4f1c-939a-d700cca5e4bb', 'Initiative', 'initiative')
  export const MovementSpeed: AttributeTemplate<number> = Attributes.defineTemplate('435e3aaa-b16b-434d-964c-6b1fd36591a8', 'Movement Speed', 'movementSpeed')
}

export namespace CreatureAttributes {
  export const HitPoints: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.HitPoints,
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
  export const Strength: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('d5918660-631d-4235-9255-c5e3ffe12533', 'Strength', 'strength'),
    initialValue: true,
  })

  export const Dexterity: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('f99bd4b3-758e-4268-93be-79e4eb705996', 'Dexterity', 'dexterity'),
    initialValue: true,
  })

  export const Constitution: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('e6a76947-c31e-4d41-8598-baefc3b1e788', 'Constitution', 'constitution'),
    initialValue: true,
  })

  export const Wisdom: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('72e3dd16-6fb9-4498-8c29-60f489309819', 'Wisdom', 'wisdom'),
    initialValue: true,
  })

  export const Intelligence: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('e96116ef-9615-4edc-8c83-f0bcb38f5319', 'Intelligence', 'intelligence'),
    initialValue: true,
  })

  export const Charisma: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('799e5562-277d-4af6-9e61-add32c761ac6', 'Charisma', 'charisma'),
    initialValue: true,
  })

  export const StrengthModifier: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('ab339ba9-3ff2-4cc4-8bac-454078938c27', 'Strength Modifier', 'strengthModifier'),
    base: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Strength.variable, -10]), .5]), 0, RoundingMode.Down),
  })

  export const DexterityModifier: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('ce1eaad3-8c00-4313-8e50-b7168246b223', 'Dexterity Modifier', 'dexterityModifier'),
    base: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Dexterity.variable, -10]), .5]), 0, RoundingMode.Down),
  })

  export const ConstitutionModifier: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('5c25bfaa-0bbc-4482-aad6-951ff1fba801', 'Constitution Modifier', 'constitutionModifier'),
    base: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Constitution.variable, -10]), .5]), 0, RoundingMode.Down),
  })

  export const WisdomModifier: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('3b60723b-f7f7-48f6-a747-0e72f14a59fa', 'Wisdom Modifier', 'wisdomModifier'),
    base: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Wisdom.variable, -10]), .5]), 0, RoundingMode.Down),
  })

  export const IntelligenceModifier: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('054fdd7c-a274-4533-929c-3a0939468bb7', 'Intelligence Modifier', 'intelligenceModifier'),
    base: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Intelligence.variable, -10]), .5]), 0, RoundingMode.Down),
  })

  export const CharismaModifier: Attribute<number> = Attributes.defineAttribute({
    template: Attributes.defineTemplate('60f4ffa4-9486-4c23-8876-86b6a2ea5f30', 'Charisma Modifier', 'charismaModifier'),
    base: NumericExpressions.round(NumericExpressions.multiply([NumericExpressions.sum([Charisma.variable, -10]), .5]), 0, RoundingMode.Down),
  })

  export const HitPoints: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.HitPoints,
    base: NumericExpressions.multiply([CharacterValues.Level, ConstitutionModifier.variable]),
  })

  export const Initiative: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.Initiative,
    base: DexterityModifier.variable,
  })

  export const MovementSpeed: Attribute<number> = Attributes.defineAttribute<number>({
    template: AttributeTemplates.MovementSpeed,
    base: 30,
  })
}