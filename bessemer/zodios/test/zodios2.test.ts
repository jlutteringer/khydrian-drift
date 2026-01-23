import { Zodios } from '@bessemer/zodios'
import { RequestApi } from './zodios-test-api'
import { Uuid4 } from '@bessemer/cornerstone'

describe('Zodios', () => {
  const zodios = new Zodios(RequestApi)

  test('Zodios.fetchRequestById', async () => {
    const response = await zodios.fetchRequestById({
      params: { requestId: Uuid4.generate() },
      queries: { cache: true },
      headers: { 'X-Api-Key': Uuid4.generate(), 'Content-Type': 'application/json' },
    })

    if (response.isSuccess) {
    } else {
      response.value
    }
  })
})
