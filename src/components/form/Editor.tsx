import React, { useState, useEffect, useCallback } from 'react'
import 'monaco-editor'
import MonacoEditor from 'react-monaco-editor'
import Grid from '@material-ui/core/Grid'
import FormLabel from '@material-ui/core/FormLabel'

export interface EditorProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
}

const Editor: React.FC<EditorProps> = (props) => {
  const { label, value, onChange } = props
  const [code, setCode] = useState('')
  useEffect(() => {
    if (value) setCode(value)
  }, [value])
  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <FormLabel>{label || ''}</FormLabel>
      </Grid>
      <Grid item>
        <MonacoEditor
          width="100%"
          height="200"
          language="json"
          theme="vs-dark"
          value={code}
          onChange={useCallback((value) => {
            if (onChange) onChange(value)
            setCode(value)
          }, [onChange])}
        />
      </Grid>
    </Grid>
  )
}

export default React.memo(Editor)
