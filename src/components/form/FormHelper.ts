import { ChangeEvent } from 'react'

export type FormError<T> = { [key in keyof T]: string | null }

export interface FormPropType <FormType> {
  defaultValue: FormType
  onSubmit: (form: FormType) => FormType
}

export function getValueFromChangeEvent<Value> (event: unknown) {
  return (event as ChangeEvent<{ value: Value }>).target.value as Value
}

export function getValueFromCheckboxEvent (event: unknown) {
  return (event as ChangeEvent<HTMLInputElement>).target.checked
}

export function getValueFromValue<Value> (event: unknown) {
  return event as Value
}

export function createHandleChange<EventType extends { value: unknown }, FormData> (
  onFormChange: (changed: FormData) => void,
  otherValue: FormData,
  setError?: (error: FormError<FormData>) => void,
  error?: FormError<FormData>
) {
  return (label: keyof FormData) => (event: ChangeEvent<EventType>) => {
    if (setError && error && error[label] !== null) setError({ ...error, [label]: null })
    onFormChange({ ...otherValue, [label]: event.target.value })
  }
}
