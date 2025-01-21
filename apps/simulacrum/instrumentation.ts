export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { Bessemer } = await import('@bessemer/framework')
    const { ApplicationModule } = await import('@simulacrum/common/application')
    const { ApplicationRuntimeModule } = await import('@simulacrum/common/application/common')
    const { ApplicationProperties } = await import('@simulacrum/common/application/properties')

    Bessemer.configure({
      applicationProvider: ApplicationModule,
      runtimeProvider: ApplicationRuntimeModule,
      properties: ApplicationProperties,
    })
  }
}
