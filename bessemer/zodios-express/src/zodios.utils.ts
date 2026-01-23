type MapPrefixPath<T extends readonly unknown[], PrefixValue extends string, ACC extends unknown[] = []> = T extends readonly [
  infer Head,
  ...infer Tail
]
  ? MapPrefixPath<
      Tail,
      PrefixValue,
      [
        ...ACC,
        {
          [K in keyof Head]: K extends 'path' ? (Head[K] extends string ? `${PrefixValue}${Head[K]}` : Head[K]) : Head[K]
        }
      ]
    >
  : ACC

export const prefixApi = <Prefix extends string, Api extends readonly any[]>(prefix: Prefix, api: Api) => {
  return api.map((endpoint) => ({
    ...endpoint,
    path: `${prefix}${endpoint.path}`,
  })) as MapPrefixPath<Api, Prefix>
}
