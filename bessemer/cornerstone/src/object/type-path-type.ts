// see https://github.com/sinclairnick/jsonpath-ts for the original source

import { Arrayable } from 'type-fest'

export type TypePathParse<TPath extends string, TValue extends any> = TypePathGet<ParseTypePath<TPath>, TValue>

// JOHN we don't have all of the concrete types represented here
export type NameSelector = string
export type IndexSelector = Array<number>
export type WildcardSelector = '*'
export type WildcardIndexSelector = ['*']

export type ObjectPathSelector = NameSelector | IndexSelector
export type TypePathSelector = ObjectPathSelector | WildcardSelector | WildcardIndexSelector
export type ObjectPathConcreteType = Array<ObjectPathSelector>
export type TypePathConcreteType = Array<TypePathSelector>

export interface NameSelectorType<TKey extends string> {
  type: 'NameSelector'
  key: TKey
}
export interface AnyNameSelectorType extends NameSelectorType<string> {}
export interface IndexSelectorType<TIndex extends number> {
  type: 'IndexSelector'
  index: TIndex
}
export interface AnyIndexSelectorType extends IndexSelectorType<number> {}
export interface WildcardSelectorType {
  type: 'WildcardSelector'
}
export interface AnyWildcardSelectorType extends WildcardSelectorType {}
export interface ArraySliceSelectorType<
  TStart extends number | never = never,
  TEnd extends number | never = never,
  TStep extends number | never = never
> {
  type: 'ArraySliceSelector'
  start: TStart
  end: TEnd
  step: TStep
}
export interface AnySliceSelectorType extends ArraySliceSelectorType<any, any, any> {}

type AnyObjectPathSelectorType = AnyIndexSelectorType | AnyNameSelectorType
type AnyTypePathSelectorType = AnyObjectPathSelectorType | AnySliceSelectorType | AnyWildcardSelectorType

type ParseBracketSelector<TInner extends string> =
  TInner extends `${infer TStart extends number}:${infer TEnd extends number}:${infer TStep extends number}`
    ? ArraySliceSelectorType<TStart, TEnd, TStep>
    : TInner extends `:${infer TEnd extends number}:${infer TStep extends number}`
    ? ArraySliceSelectorType<never, TEnd, TStep>
    : TInner extends `::${infer TStep extends number}`
    ? ArraySliceSelectorType<never, never, TStep>
    : TInner extends `${infer TStart extends number}:${infer TEnd extends number}`
    ? ArraySliceSelectorType<TStart, TEnd, never>
    : TInner extends `:${infer TEnd extends number}`
    ? ArraySliceSelectorType<never, TEnd, never>
    : TInner extends `${string}"${infer TKey}"${string}`
    ? NameSelectorType<FormatString<TKey>>
    : TInner extends `${string}'${infer TKey}'${string}`
    ? NameSelectorType<FormatString<TKey>>
    : TInner extends `${string}*${string}`
    ? WildcardSelectorType
    : TInner extends `${infer TStart extends number}`
    ? IndexSelectorType<TStart>
    : never

type ParseBracketIndexInner<T> = T extends `${infer TFirst},${infer TRest}`
  ? [ParseBracketSelector<TFirst>, ...ParseBracketIndexInner<TRest>]
  : T extends `${infer TIndex}`
  ? [ParseBracketSelector<TIndex>]
  : []

type ParsePathInner<TPathInner extends string> = TPathInner extends `*`
  ? [WildcardSelectorType]
  : TPathInner extends `[${infer TInner}]${infer TRest}`
  ? [ParseBracketIndexInner<TInner>, ...ParsePathInner<TRest>]
  : TPathInner extends `.${infer TKey}[${infer TRest}`
  ? [...ParsePathInner<TKey>, ...ParsePathInner<`[${TRest}`>]
  : TPathInner extends `.${infer TKey}`
  ? ParsePathInner<TKey>
  : TPathInner extends `${infer TKey}.${infer TRest}`
  ? [...ParsePathInner<TKey>, ...ParsePathInner<`.${TRest}`>]
  : TPathInner extends `${infer TKey}[${infer TInner}]${infer TRest}`
  ? [NameSelectorType<TKey>, ParseBracketIndexInner<TInner>, ...ParsePathInner<TRest>]
  : TPathInner extends ''
  ? []
  : [NameSelectorType<TPathInner>]

export type ParseTypePath<TPath extends string> = ParsePathInner<TPath>

// JOHN
type FilterObjectPathSelectors<T> = T extends readonly any[]
  ? {
      [K in keyof T]: T[K] extends AnyObjectPathSelectorType
        ? T[K]
        : T[K] extends readonly any[]
        ? T[K] extends readonly AnyObjectPathSelectorType[]
          ? T[K]['length'] extends 1
            ? T[K]
            : never
          : never
        : never
    }
  : never

export type ParseObjectPath<TPath extends string> = FilterObjectPathSelectors<ParsePathInner<TPath>>

export type ObjectPathType = Array<Arrayable<AnyObjectPathSelectorType>>
export type TypePathType = Array<Arrayable<AnyTypePathSelectorType>>

export type InferObjectPath<TPath extends TypePathConcreteType> = ObjectPathType
export type InferTypePath<TPath extends TypePathConcreteType> = TypePathType

type ExtractRecordSelection<TSelector extends AnyTypePathSelectorType, TValue extends AnyRecord> = TSelector extends AnyWildcardSelectorType
  ? Array<TValue[keyof TValue]>
  : TSelector extends NameSelectorType<infer TKey>
  ? TKey extends keyof TValue
    ? TValue[TKey]
    : never
  : never

type ExtractArraySelection<TSelector extends AnyTypePathSelectorType, TValue extends AnyArray> = TSelector extends AnyWildcardSelectorType
  ? TValue
  : TSelector extends IndexSelectorType<infer TIndex>
  ? PickArray<TIndex, TValue>
  : TSelector extends ArraySliceSelectorType<infer TStart, infer TEnd> // TODO: Handle step somehow
  ? Slice<TValue, OrDefault<TStart, 0>, OrDefault<TEnd, TValue['length']>>
  : TSelector extends NameSelectorType<infer TKey>
  ? PickArrayField<TValue, TKey>
  : TSelector extends WildcardSelectorType
  ? TValue
  : []

type ExtractMultipleArraySelections<TSelectors extends AnyTypePathSelectorType[], TValue extends AnyArray> = TSelectors['length'] extends 0
  ? []
  : TSelectors extends [infer TFirst, ...infer TRest]
  ? TFirst extends AnyTypePathSelectorType
    ? TRest extends AnyTypePathSelectorType[]
      ? [ExtractArraySelection<TFirst, TValue>, ...ExtractMultipleArraySelections<TRest, TValue>]
      : ExtractArraySelection<TFirst, TValue>
    : []
  : []

type ExtractSelection<TSelector extends AnyTypePathSelectorType | AnyTypePathSelectorType[], TValue> = TValue extends any
  ? TValue extends undefined
    ? undefined
    : TValue extends null
    ? undefined
    : TValue extends AnyArray
    ? TSelector extends AnyTypePathSelectorType[]
      ? TSelector['length'] extends 1
        ? ExtractArraySelection<TSelector[0], Extract<TValue, AnyArray>>
        : ExtractMultipleArraySelections<TSelector, Extract<TValue, AnyArray>>
      : TSelector extends AnyTypePathSelectorType
      ? ExtractArraySelection<TSelector, Extract<TValue, AnyArray>>
      : never
    : TValue extends AnyRecord
    ? TSelector extends AnyTypePathSelectorType
      ? ExtractRecordSelection<TSelector, Extract<TValue, AnyRecord>>
      : never
    : never
  : never

export type TypePathGet<TSelectors extends TypePathType, TValue> = TSelectors['length'] extends 0
  ? TValue
  : TSelectors extends [infer TFirst, ...infer TRest]
  ? TFirst extends AnyTypePathSelectorType | AnyTypePathSelectorType[]
    ? TRest extends TypePathType
      ? TypePathGet<TRest, ExtractSelection<TFirst, TValue>>
      : ExtractSelection<TFirst, TValue>
    : []
  : []

type AnyRecord = Record<PropertyKey, any>
type AnyArray = any[]
type StripWhitespace<T extends string> = T extends ` ${infer TRest}`
  ? StripWhitespace<TRest>
  : T extends `${infer TRest} `
  ? StripWhitespace<TRest>
  : T
type StripQuotes<T extends string> = T extends `'${infer TValue}'` ? TValue : T extends `"${infer TValue}"` ? TValue : T
type FormatString<T extends string> = '' extends T ? never : StripQuotes<StripWhitespace<T>>

type PickArray<TIndex extends number, TArray extends any[]> = TArray['length'] extends 0
  ? never
  : TArray extends [...infer TRest, infer TLast]
  ? TIndex extends TRest['length']
    ? TLast
    : PickArray<TIndex, TRest>
  : TArray extends Array<infer T>
  ? T | undefined
  : never

type ToPositive<N extends number, Arr extends unknown[]> = `${N}` extends `-${infer P extends number}` ? Slice<Arr, P>['length'] : N

type InitialN<Arr extends unknown[], N extends number, _Acc extends unknown[] = []> = _Acc['length'] extends N | Arr['length']
  ? _Acc
  : InitialN<Arr, N, [..._Acc, Arr[_Acc['length']]]>

type Slice<Arr extends unknown[], Start extends number = 0, End extends number = Arr['length']> = InitialN<Arr, ToPositive<End, Arr>> extends [
  ...InitialN<Arr, ToPositive<Start, Arr>>,
  ...infer Rest
]
  ? Rest
  : []

type PickArrayField<TArr extends any[], TKey extends string> = TArr extends [infer TFirst, ...infer TRest]
  ? [TFirst[TKey & keyof TFirst], ...PickArrayField<TRest, TKey>]
  : TArr extends []
  ? []
  : TArr extends Array<infer T>
  ? Array<T extends any ? (TKey extends keyof T ? T[TKey] : undefined) : never>
  : []

type OrDefault<T, D> = [T] extends [never] ? D : T
