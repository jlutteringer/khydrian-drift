import { BessemerApplicationContext } from '@bessemer/framework'
import { Tag } from '@bessemer/cornerstone/tag'
import { ResourceNamespace } from '@bessemer/cornerstone/resource'

export const getNamespace = (context: BessemerApplicationContext): ResourceNamespace => {
  return context.id
}

export const getTags = (context: BessemerApplicationContext): Array<Tag> => {
  return context.client.tags
}
