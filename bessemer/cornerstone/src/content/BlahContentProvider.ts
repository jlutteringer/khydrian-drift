import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { ContentData, ContentKey, ContentProvider, ContentReference, ContentSector } from '@bessemer/cornerstone/content'
import { ReferenceType } from '@bessemer/cornerstone/reference'
import { Tag } from '@bessemer/cornerstone/tag'

abstract class BlahContentProvider<ContextType extends AbstractApplicationContext = AbstractApplicationContext>
  implements ContentProvider<ContextType>
{
  fetchContentByIds = async (references: Array<ReferenceType<ContentReference>>, context: ContextType): Promise<Array<ContentData>> => {
    return null!
  }

  fetchContentByKeys = async (keys: Array<ContentKey>, tags: Array<Tag>, context: ContextType): Promise<Array<ContentData>> => {
    return null!
  }

  fetchContentBySectors = async (sectors: Array<ContentSector>, tags: Array<Tag>, context: ContextType): Promise<Array<ContentData>> => {
    return null!
  }
}
