import { ErrorAttribute, ErrorCode } from '@bessemer/cornerstone/error-event'
import { ErrorEvents } from '@bessemer/cornerstone'
import { ResourceKey } from '@bessemer/cornerstone/resource'

export namespace AdvisoryLockUtil {
  const AdvisoryLockLockedErrorCode: ErrorCode = 'advisory-lock.locked'
  const ResourceKeyAttribute: ErrorAttribute<string> = 'resourceKey'

  export const buildLockLockedError = (resourceKey: ResourceKey) => {
    return ErrorEvents.of({ code: AdvisoryLockLockedErrorCode, attributes: { [ResourceKeyAttribute]: resourceKey } })
  }
}
