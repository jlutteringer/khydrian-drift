import { Strings } from '@bessemer/cornerstone'

test('Strings.splitFirst', () => {
  expect(Strings.splitFirst('this.is.a.string.', '.')).toEqual({ selection: 'this', separator: '.', rest: 'is.a.string.' })
  expect(Strings.splitFirst('', '/')).toEqual({ selection: null, separator: null, rest: '' })
  expect(Strings.splitFirst('thisisastring', '.')).toEqual({ selection: null, separator: null, rest: 'thisisastring' })
  expect(Strings.splitFirst('this123is123a123string', '123')).toEqual({ selection: 'this', separator: '123', rest: 'is123a123string' })
  expect(Strings.splitFirst('/test', '/')).toEqual({ selection: '', separator: '/', rest: 'test' })
  expect(Strings.splitFirst('test/', '/')).toEqual({ selection: 'test', separator: '/', rest: '' })
  expect(Strings.splitFirst('//test/', '/')).toEqual({ selection: '', separator: '/', rest: '/test/' })
})

test('Strings.splitLast', () => {
  expect(Strings.splitLast('.this.is.a.string', '.')).toEqual({ selection: 'string', separator: '.', rest: '.this.is.a' })
  expect(Strings.splitLast('', '/')).toEqual({ selection: null, separator: null, rest: '' })
  expect(Strings.splitLast('thisisastring', '.')).toEqual({ selection: null, separator: null, rest: 'thisisastring' })
  expect(Strings.splitLast('this123is123a123string', '123')).toEqual({ selection: 'string', separator: '123', rest: 'this123is123a' })
  expect(Strings.splitLast('/test', '/')).toEqual({ selection: 'test', separator: '/', rest: '' })
  expect(Strings.splitLast('test/', '/')).toEqual({ selection: '', separator: '/', rest: 'test' })
  expect(Strings.splitLast('//test/', '/')).toEqual({ selection: '', separator: '/', rest: '//test' })
})
