import React, { PropsWithChildren, useContext } from 'react'
import Button from '@material-ui/core/Button'
import { FormState } from './FormHook'
import { PresentationProps } from '../Presentation'

interface ExampleButtonProps {
  context: React.Context<FormState<PresentationProps>>
  field: keyof PresentationProps
  example: string
  responseCode?: string
}

const ExampleButton: React.FC<PropsWithChildren<ExampleButtonProps>> = (props) => {
  const { context, field, example, responseCode, children } = props
  const { dispatch, value } = useContext(context)
  return (
    <Button
      onClick={() => {
        if (responseCode !== undefined) {
          dispatch({ type: 'set', value: { ...value, responseCode, [field]: example } })
        } else {
          dispatch({ type: 'change', label: field, value: example })
        }
      }}
      variant="outlined"
    >
      {children}
    </Button>
  )
}

export default React.memo(ExampleButton)