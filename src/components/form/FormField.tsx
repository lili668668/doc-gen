import React, { useCallback, useContext } from 'react'
import { FormState } from './FormHook'

interface PropTypes<FormType> {
  component: React.ElementType
  name: keyof FormType
  context: React.Context<FormState<FormType>>
  helperText?: string
}

const FormField = function<FormType, T> (props: PropTypes<FormType> & T) {
  const { component: Component, name, context, helperText, ...restProps } = props

  const { value, handleChange, handleOther, error, disabled } = useContext(context)

  return (
    <Component
      value={value[name]}
      onChange={useCallback(handleChange(name), [])}
      onFocus={useCallback(handleOther('focus', name), [])}
      onBlur={useCallback(handleOther('blur', name), [])}
      helperText={error[name] || helperText || ''}
      error={error[name] !== null}
      disabled={disabled[name]}
      {...restProps}
    />
  )
}

export default FormField
