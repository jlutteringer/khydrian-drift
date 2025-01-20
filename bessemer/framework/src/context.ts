import { BessemerApplicationContext } from '@bessemer/framework'
import { Tag } from '@bessemer/cornerstone/tag'
import { ResourceNamespace } from '@bessemer/cornerstone/resource'
import { Tags } from '@bessemer/cornerstone'

export const getResourceNamespace = (context: BessemerApplicationContext): ResourceNamespace => {
  return Tags.serializeTags(getTags(context)) as ResourceNamespace
}

export const getTags = (context: BessemerApplicationContext): Array<Tag> => {
  return context.client.tags
}
