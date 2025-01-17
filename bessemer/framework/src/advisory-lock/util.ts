import { ErrorAttribute, ErrorCode } from '@bessemer/cornerstone/error-event'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { ErrorEvents } from '@bessemer/cornerstone'

export namespace AdvisoryLockUtil {
  const AdvisoryLockLockedErrorCode: ErrorCode = 'advisory-lock.locked'
  const ResourceKeyAttribute: ErrorAttribute<string> = 'resourceKey'

  export const buildLockLockedError = (resourceKey: ResourceKey) => {
    return ErrorEvents.of({ code: AdvisoryLockLockedErrorCode, attributes: { [ResourceKeyAttribute]: resourceKey } })
  }
}
