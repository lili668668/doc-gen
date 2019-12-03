import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { toYaml } from '../helpers/documentHelper';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type PlatForm = 'COMMON' | 'AGENT' | 'ADMIN'

export interface PresentationProps {
  platform: PlatForm
  assignee: string
  path: string
  method: Method
  description: string
  tag: string
  query: string
  request: string
  response: string
}

const Presentation: React.FC<PresentationProps> = (props) => {
  return (
    <SyntaxHighlighter language="javascript" style={monokai} showLineNumbers>
      {toYaml(props)}
    </SyntaxHighlighter>
  )
}

export default React.memo(Presentation)