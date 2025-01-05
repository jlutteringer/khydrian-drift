import { BessemerApplicationContext } from '@bessemer/framework'
import { Tag } from '@bessemer/cornerstone/tag'

export const getTags = (context: BessemerApplicationContext): Array<Tag> => {
  return context.client.tags
}
