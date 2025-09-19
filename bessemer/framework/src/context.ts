import { BessemerApplicationContext } from '@bessemer/framework'
import { Tag } from '@bessemer/cornerstone/tag'
import { ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { ResourceKeys } from '@bessemer/cornerstone'

export const getNamespace = (context: BessemerApplicationContext): ResourceNamespace => {
  return ResourceKeys.namespace(context.id)
}

export const getTags = (context: BessemerApplicationContext): Array<Tag> => {
  return context.client.tags
}
