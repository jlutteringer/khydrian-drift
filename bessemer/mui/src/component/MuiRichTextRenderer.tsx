import { ReactNode, useMemo } from 'react'
import { RichTextElement, RichTextRenderer, RichTextRendererProps } from '@bessemer/react/component/RichTextRenderer'
import { Dictionary } from '@bessemer/cornerstone/types'
import { Objects } from '@bessemer/cornerstone'
import {
  Box,
  Chip,
  Divider,
  Link,
  List,
  ListItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Code } from '@mui/icons-material'

export const DocTextElement: RichTextElement = (props) => <>{props.children}</>

export const TextTextElement: RichTextElement = (props) => {
  if (!props.content.marks) {
    return <span>{props.content.text}</span>
  }

  // Sort marks to ensure consistent nesting order
  const sortedMarks = [...props.content.marks].sort((a, b) => {
    const order = ['link', 'code', 'bold', 'italic', 'underline', 'strike']
    return order.indexOf(a.type) - order.indexOf(b.type)
  })

  return sortedMarks.reduce((wrapped: any, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{wrapped}</strong>
      case 'italic':
        return <em>{wrapped}</em>
      case 'strike':
        return <del>{wrapped}</del>
      case 'underline':
        return <u>{wrapped}</u>
      case 'code':
        return <code>{wrapped}</code>
      case 'link':
        const href = mark.attrs?.href || ''
        return <Link href={href}>{wrapped}</Link>
      default:
        return wrapped
    }
  }, props.content.text)
}

const paragraph: RichTextElement = (props) => {
  return <Typography variant="body1">{props.children}</Typography>
}

const heading: RichTextElement = (props) => {
  const level = props.content.level || 1
  return <Typography variant={`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'}>{props.children}</Typography>
}

const bulletList: RichTextElement = (props) => {
  return <List>{props.children}</List>
}

const orderedList: RichTextElement = (props) => {
  return <List component="ol">{props.children}</List>
}

const listItem: RichTextElement = (props) => {
  return <ListItem>{props.children}</ListItem>
}

const horizontalRule: RichTextElement = () => {
  return <Divider sx={{ my: 4 }} />
}

export const HardBreakTextElement: RichTextElement = () => {
  return <br />
}

const blockquote: RichTextElement = (props) => {
  return (
    <Typography
      component="blockquote"
      sx={{
        borderLeft: 4,
        borderColor: 'grey.300',
        pl: 4,
        py: 2,
        my: 4,
      }}
    >
      {props.children}
    </Typography>
  )
}

const codeBlock: RichTextElement = (props) => {
  const language = props.content.language || ''

  return (
    <Typography
      component="pre"
      sx={{
        bgcolor: 'grey.100',
        p: 4,
        borderRadius: 1,
        overflow: 'auto',
        fontFamily: 'monospace',
      }}
    >
      <Code sx={{ mr: 2 }} />
      <code className={language ? `language-${language}` : ''}>{props.children}</code>
    </Typography>
  )
}

const img: RichTextElement = (props) => {
  const { src, alt, title } = props.content
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      title={title}
      sx={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  )
}

const mention: RichTextElement = (props) => {
  return (
    <Chip
      label={props.content.label || props.content.id}
      size="small"
      sx={{ mx: 0.5 }}
    />
  )
}

const table: RichTextElement = (props) => {
  return (
    <TableContainer
      component={Paper}
      sx={{ my: 2 }}
    >
      <Table size="small">
        {Array.isArray(props.children)
          ? props.children.map((child, index) => (child?.props?.content?.type === 'tableHeader' ? child : <TableBody key={index}>{child}</TableBody>))
          : props.children}
      </Table>
    </TableContainer>
  )
}

const tableRow: RichTextElement = (props) => {
  return <TableRow>{props.children}</TableRow>
}

const tableCell: RichTextElement = (props) => {
  return <TableCell align={props.content.alignment || 'left'}>{props.children}</TableCell>
}

const tableHeader: RichTextElement = (props) => {
  return (
    <TableHead>
      <TableRow>{props.children}</TableRow>
    </TableHead>
  )
}

const defaultHandlers: Dictionary<RichTextElement> = {
  doc: DocTextElement,
  paragraph,
  text: TextTextElement,
  heading,
  bulletList,
  orderedList,
  listItem,
  horizontalRule,
  hardBreak: HardBreakTextElement,
  blockquote,
  codeBlock,
  img,
  mention,
  table,
  tableRow,
  tableCell,
  tableHeader,
}

export const MuiRichTextRenderer = ({ content, handlers }: RichTextRendererProps): ReactNode => {
  const mergedHandlers = useMemo(() => {
    return Objects.deepMerge(defaultHandlers, handlers)
  }, [handlers])

  return (
    <RichTextRenderer
      content={content}
      handlers={mergedHandlers}
    />
  )
}
