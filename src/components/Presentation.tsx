import React, { useCallback, createRef } from 'react'
import { makeStyles } from '@material-ui/core'
import SyntaxHighlighter from 'react-syntax-highlighter'
import Button from '@material-ui/core/Button'
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
  responseCode: string
  response: string
}

const useStyles = makeStyles((theme) => ({
  invisible: {
    position: 'absolute',
    top: theme.spacing(4),
    left: theme.spacing(4),
    height: 0,
    width: 0
  }
}))

const Presentation: React.FC<PresentationProps> = (props) => {
  const classes = useStyles()
  const yaml = toYaml(props)
  const ref = createRef<HTMLTextAreaElement>()
  return (
    <React.Fragment>
      <Button
        variant="contained"
        color="primary"
        onClick={useCallback(() => {
          if (ref && ref.current) {
            ref.current.select()
          }
          document.execCommand('copy')
        }, [ref])}
      >
        複製
      </Button>
      <textarea className={classes.invisible} readOnly value={yaml} ref={ref} />
      <SyntaxHighlighter language="yaml" style={monokai} showLineNumbers>
        {yaml}
      </SyntaxHighlighter>
    </React.Fragment>
  )
}

export default React.memo(Presentation)