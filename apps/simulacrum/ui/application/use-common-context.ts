import { ApplicationContext } from '@simulacrum/common/application'
import { useBessemerCommonContext } from '@bessemer/framework/hooks/use-common-context'
import { ClientContextType } from '@bessemer/framework'

export const useCommonContext = (): ClientContextType<ApplicationContext> => {
  return useBessemerCommonContext()
}
