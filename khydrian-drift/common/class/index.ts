import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { Arrays, Preconditions, References } from '@khydrian-drift/util'
import { ApplicationContext } from '@khydrian-drift/common/context'
import { Effect } from '@khydrian-drift/common/effect'
import { ClassLevel } from '@khydrian-drift/common/character'

export type ClassReference = Reference<'Class'>

export type ClassProps = {
  name: string
  progressionTable: Record<number, Array<Effect>>
}

export type Class = Referencable<ClassReference> & ClassProps & {}

export const reference = (id: string, name: string): ClassReference => {
  return References.reference(id, 'Class', name)
}

export const defineClass = (reference: ClassReference, props: ClassProps): Class => {
  return {
    reference: References.reference(reference, 'Class', props.name),
    ...props,
  }
}

export const getClass = (reference: ClassReference, context: ApplicationContext): Class => {
  const matchingClass = context.ruleset.classes.find((it) => it.reference.id === reference.id)
  Preconditions.isPresent(matchingClass)
  return matchingClass
}

export const getEffects = (classes: Array<ClassLevel>, context: ApplicationContext): Array<Effect> => {
  return classes.flatMap((selection) => {
    const clazz = getClass(selection.class, context)

    const effects = Arrays.range(1, selection.level + 1).flatMap((level) => {
      const effectsForLevel = clazz.progressionTable[level] ?? []

      return effectsForLevel.map((it) => {
        const sourcedEffect: Effect = { ...it, source: { class: clazz.reference, level } }
        return sourcedEffect
      })
    })

    return effects
  })
}
