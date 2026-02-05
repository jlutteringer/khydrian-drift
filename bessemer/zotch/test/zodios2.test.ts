import { RequestApi } from './zodios-test-api'
import { Instants, Uuid4 } from '@bessemer/cornerstone'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { RequestDto, RequestStatus } from './zod-test-schema'
import { expectTypeOf } from 'expect-type'
import { Result } from '@bessemer/cornerstone/result'
import { ZotchClient } from '@bessemer/zotch'
import { ZotchErrorType } from '@bessemer/zotch/zotch-error'

const testRequest: RequestDto = {
  id: Uuid4.generate(),
  organizerId: Uuid4.generate(),
  sponsorId: Uuid4.generate(),
  quoteNumber: 'Q-12345',
  status: RequestStatus.Quote,
  name: 'Test Request',
  isProposal: false,
  public: true,
  items: [],
  metadata: {},
  createdAt: Instants.toLiteral(Instants.now()),
  updatedAt: Instants.toLiteral(Instants.now()),
}

describe('Zodios', () => {
  test('Zodios.fetchRequestById success', async () => {
    const requestId = Uuid4.generate()
    const apiKey = Uuid4.generate()

    const zodios = new ZotchClient(RequestApi, {
      fetch: async (url, request) => {
        expect(url).toContain(`/requests/${requestId}`)
        expect(url).toContain('cache=true')

        const headers = new Headers(request?.headers)
        expect(headers.get('X-Api-Key')).toBe(apiKey)
        expect(headers.get('Content-Type')).toBe('application/json')

        expect(request?.method).toBe(HttpMethod.Get)

        return new Response(JSON.stringify(testRequest), { status: 200 })
      },
    })

    {
      const response = await zodios.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
      })

      expect(response.isSuccess).toBe(true)
      expect(response.value).toEqual(testRequest)
    }

    {
      const response = await zodios.fetchRequestById({
        params: { requestId },
        headers: { 'X-Api-Key': apiKey },
      })

      if (!response.isSuccess) {
        const a = response.value
        if (a.type === ZotchErrorType.Structured) {
          const b = a.value
          const c = a.status
        }
      }
      expectTypeOf(response).toExtend<Result<RequestDto, ZodiosError<any>>>()
      expect(response.isSuccess).toBe(true)
      expect(response.value).toEqual(testRequest)
    }
  })

  test('Zodios.fetchRequestById not found', async () => {
    const requestId = Uuid4.generate()
    const apiKey = Uuid4.generate()

    const zodios = new Zodios(RequestApi, {
      fetch: async () => {
        return new Response(JSON.stringify(testRequest), { status: 404 })
      },
    })

    {
      const response = await zodios.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
      })

      expect(response.isSuccess).toBe(false)
      console.log('response', response)
    }
  })
})
