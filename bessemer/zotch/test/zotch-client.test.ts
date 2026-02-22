import { RequestApi } from './zotch-test-api'
import { Instants, Results, Uuid4 } from '@bessemer/cornerstone'
import { CreateRequestDto, CreateRequestInput, RequestDto, RequestStatus } from './schema/test-request'
import { expectTypeOf } from 'expect-type'
import { Result } from '@bessemer/cornerstone/result'
import { Zotch } from '@bessemer/zotch'
import { ZotchError, ZotchErrorType } from '@bessemer/zotch/zotch-error'

const emptyRequest: RequestDto = {
  id: Uuid4.generate(),
  organizerId: Uuid4.generate(),
  sponsorId: Uuid4.generate(),
  quoteNumber: 'Q-12345',
  status: RequestStatus.Quote,
  name: 'Test Request',
  isProposal: false,
  public: false,
  items: [],
  metadata: {},
  createdAt: Instants.toLiteral(Instants.now()),
  updatedAt: Instants.toLiteral(Instants.now()),
}

describe('ZotchClient.fetchRequestById', () => {
  test('test success', async () => {
    const requestId = Uuid4.generate()
    const apiKey = Uuid4.generate()

    const zotch = Zotch.client(RequestApi, {
      baseUrl: 'https://localhost:8080/api/v1',
      fetch: async (url, request) => {
        expect(url).toContain(`https://localhost:8080/api/v1/requests/${requestId}`)
        expect(url).toContain('cache=true')

        const headers = new Headers(request?.headers)
        expect(headers.get('X-Api-Key')).toBe(apiKey)
        expect(headers.get('Content-Type')).toBe('application/json')

        expect(request?.method).toBe('GET')

        return Response.json(emptyRequest, { status: 200 })
      },
    })

    {
      const response = await zotch.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertSuccess(response)
      expect(response).toEqual(emptyRequest)
    }

    {
      const response = await zotch.fetchRequestById({
        params: { requestId },
        headers: { 'X-Api-Key': apiKey },
      })

      expectTypeOf(response).toExtend<Result<RequestDto, ZotchError<{ status: 404; value: unknown } | { status: 401; value: number }>>>()
      Results.assertSuccess(response)
      expect(response).toEqual(emptyRequest)
    }
  })

  test('test not found error', async () => {
    const requestId = Uuid4.generate()
    const apiKey = Uuid4.generate()

    const zotch = Zotch.client(RequestApi, {
      fetch: async () => {
        return new Response(undefined, { status: 404 })
      },
    })

    {
      const response = await zotch.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertFailure(response)
      Zotch.assertStructuredError(response.value)
      expect(response.value.status).toBe(404)
    }
  })

  test('test fetch failure', async () => {
    const requestId = Uuid4.generate()
    const apiKey = Uuid4.generate()

    const zotch = Zotch.client(RequestApi, {
      fetch: async () => {
        throw new Error('Oh no! Fetch failed!')
      },
    })

    {
      const response = await zotch.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertFailure(response)
      expect(response.value.type).toBe(ZotchErrorType.FetchFailed)
    }
  })

  test('test invalid request', async () => {
    const apiKey = Uuid4.generate()
    let fetchInvoked = false

    const zotch = Zotch.client(RequestApi, {
      fetch: async () => {
        fetchInvoked = true
        throw new Error('Fetch failed')
      },
    })

    {
      const response = await zotch.fetchRequestById({
        params: { requestId: null! },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertFailure(response)
      expect(fetchInvoked).toBe(false)
      expect(response.value.type).toBe(ZotchErrorType.RequestInvalid)
    }

    {
      const response = await zotch.confirmQuote({
        params: { requestId: null! },
        headers: { 'X-Api-Key': apiKey } as any,
      })

      Results.assertFailure(response)
      expect(fetchInvoked).toBe(false)
      expect(response.value.type).toBe(ZotchErrorType.RequestInvalid)
    }
  })

  test('test invalid response', async () => {
    const requestId = Uuid4.generate()
    const apiKey = Uuid4.generate()

    {
      const zotch = Zotch.client(RequestApi, {
        fetch: async () => {
          return Response.json('This is an invalid response body!', { status: 200 })
        },
      })

      const response = await zotch.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertFailure(response)
      expect(response.value.type).toBe(ZotchErrorType.ResponseInvalid)
    }

    {
      const zotch = Zotch.client(RequestApi, {
        fetch: async () => {
          return Response.json({ key: 'invalid', value: 'response' }, { status: 200 })
        },
      })

      const response = await zotch.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertFailure(response)
      expect(response.value.type).toBe(ZotchErrorType.ResponseInvalid)
    }
  })

  test('test invalid error', async () => {
    const requestId = Uuid4.generate()
    const apiKey = Uuid4.generate()

    {
      const zotch = Zotch.client(RequestApi, {
        fetch: async () => {
          return Response.json('hello', { status: 401 })
        },
      })

      const response = await zotch.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertFailure(response)
      expect(response.value.type).toBe(ZotchErrorType.ResponseInvalid)
    }

    {
      const zotch = Zotch.client(RequestApi, {
        fetch: async () => {
          return new Response(JSON.stringify({ value: 50 }), { status: 401 })
        },
      })

      const response = await zotch.fetchRequestById({
        params: { requestId },
        queries: { cache: true },
        headers: { 'X-Api-Key': apiKey },
      })

      Results.assertFailure(response)
      expect(response.value.type).toBe(ZotchErrorType.ResponseInvalid)
    }
  })
})

describe('ZotchClient.fetchPublicRequestById', () => {
  test('headers not required', async () => {
    const requestId = Uuid4.generate()

    const zotch = Zotch.client(RequestApi, {
      baseUrl: 'https://localhost:8080/api/v1',
      fetch: async (url, request) => {
        expect(url).toContain(`https://localhost:8080/api/v1/requests/${requestId}/public`)
        expect(request?.method).toBe('GET')

        return Response.json(emptyRequest, { status: 200 })
      },
    })

    {
      const response = await zotch.fetchPublicRequestById({
        params: { requestId },
      })

      Results.assertSuccess(response)
      expect(response).toEqual(emptyRequest)
    }
  })
})

describe('ZotchClient.createQuote', () => {
  test('test success', async () => {
    const apiKey = Uuid4.generate()

    const zotch = Zotch.client(RequestApi, {
      fetch: async (url, request) => {
        expect(url).toBe(`/requests/quotes`)

        const headers = new Headers(request?.headers)
        expect(headers.get('X-Api-Key')).toBe(apiKey)
        expect(headers.get('Content-Type')).toBe('application/json')
        expect(headers.get('X-Account-Id')).toBe(emptyRequest.organizerId)

        expect(request?.method).toBe('POST')

        const body = JSON.parse(request?.body as string) as CreateRequestDto
        expect(body.name).toBe(emptyRequest.name)
        expect(body.sponsorId).toBe(emptyRequest.sponsorId)
        expect(body.organizerId).toBe(emptyRequest.organizerId)
        expect(body.status).toBe(RequestStatus.Quote)
        expect(body.public).toBe(false)
        expect(body.isProposal).toBe(false)

        return Response.json(emptyRequest, { status: 200 })
      },
    })

    {
      const request: CreateRequestInput = {
        name: emptyRequest.name,
        sponsorId: emptyRequest.sponsorId,
        organizerId: emptyRequest.organizerId,
      }

      const response = await zotch.createQuote({
        headers: { 'X-Api-Key': apiKey, 'X-Account-Id': emptyRequest.organizerId },
        body: request,
      })

      Results.assertSuccess(response)
      expect(response).toEqual(emptyRequest)
    }
  })
})
