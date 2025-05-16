'use client'

import { ComponentProps, forwardRef, ReactNode, Ref, useImperativeHandle, useRef } from 'react'

export type FileInputHeadlessProps = Omit<ComponentProps<'input'>, 'children'> & {
  children: (props: { openDialog: () => void }) => ReactNode
}

export const FileInputHeadless = forwardRef((props: FileInputHeadlessProps, forwardedRef: Ref<any>) => {
  const { children, ...rest } = props
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement)

  const openDialog = () => {
    inputRef.current?.click()
  }

  return (
    <span>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        {...rest}
      />

      {children({ openDialog })}
    </span>
  )
})

FileInputHeadless.displayName = 'FileInputHeadless'
