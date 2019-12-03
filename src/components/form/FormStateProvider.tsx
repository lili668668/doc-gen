import React, { PropsWithChildren } from 'react'
import {
  useForm,
  ValueGetter,
  FormValidation,
  ChangedFormGetter,
  FormState,
  DisableFieldGetter
} from './FormHook'
import { FormPropType } from './FormHelper'

interface PropTypes<FormType> extends FormPropType<FormType> {
  context: React.Context<FormState<FormType>>
  getValueFromEvent: ValueGetter<FormType>
  validation: FormValidation<FormType>
  getChangedForm?: ChangedFormGetter<FormType>
  disableField?: DisableFieldGetter<FormType>
}

const FormStateProvider = function<FormType> (props: PropsWithChildren<PropTypes<FormType>>) {
  const {
    context: Context,
    defaultValue,
    onSubmit,
    getValueFromEvent,
    validation,
    getChangedForm,
    disableField,
    children
  } = props

  const formState = useForm<FormType>({
    defaultValue,
    onSubmit,
    getValueFromEvent,
    formValidation:
    validation,
    getChangedForm,
    disableField,
  })

  const { handleSubmit } = formState

  return (
    <Context.Provider value={formState}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </Context.Provider>
  )
}

export default FormStateProvider
