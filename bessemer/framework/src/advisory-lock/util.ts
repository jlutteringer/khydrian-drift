import { ErrorAttribute, ErrorCode } from '@bessemer/cornerstone/error/error-event'
import { ErrorEvents } from '@bessemer/cornerstone'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'

export namespace AdvisoryLockUtil {
  const AdvisoryLockLockedErrorCode = 'advisory-lock/locked' as ErrorCode
  const ResourceKeyAttribute: ErrorAttribute<string> = 'resourceKey'

  export const buildLockLockedError = (resourceKey: ResourceKey) => {
    return ErrorEvents.from({
      code: AdvisoryLockLockedErrorCode,
      message: `${resourceKey} is locked.`,
      attributes: { [ResourceKeyAttribute]: resourceKey },
    })
  }
}
