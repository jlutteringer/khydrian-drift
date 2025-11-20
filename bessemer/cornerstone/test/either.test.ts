import * as Eithers from '@bessemer/cornerstone/either'
import { Either } from '@bessemer/cornerstone/either'
import { Result } from '@bessemer/cornerstone/result'

describe('Eithers.gen', () => {
  test('toodo', async () => {
    const test1 = Eithers.right(5).map((it) => it + 2)
    console.log('test1', test1)

    const test2 = await Eithers.right(5).map(async (it) => it + 2)
    console.log('test2', test2)

    const blah = Eithers.right(5) as Either<number, string>
    const foo = blah.map((it) => `${it}`)
    const syncExample = Eithers.gen(function* () {
      const a = yield* Eithers.right(5) as Either<number, string>
      const b = yield* Eithers.right(a + 'hello') as Either<string, boolean>
      return b
    })

    const syncExample2 = Eithers.gen(function* () {
      const a = yield* Eithers.right(5) as Result<number, string>
      const b = yield* Eithers.right(a + 'hello') as Result<string, boolean>
      return b
    })

    console.log('syncExample', syncExample)
    const blah2 = Eithers.right(5) as Either<number, string>
    const foo2: Either<number, string> = blah.map((it) => it + 5)
    const foo3: Either<number, number> = blah.mapLeft((it) => it.length)
  })
})
