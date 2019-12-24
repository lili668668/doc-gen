import {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  FormEvent,
  Dispatch,
  SetStateAction
} from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { FormError } from './FormHelper'
import { ValidateFunc, ValidationTimePoint } from './Validator'

const handleValidations = <FormType, Value>(
  validations: Array<{
    func: ValidateFunc<FormType>
    when: Array<ValidationTimePoint>
  }>,
  value: Value,
  form: FormType,
  lastSubmitForm: FormType,
  setError: Dispatch<SetStateAction<FormError<FormType>>>
) => {
  validations.some((validation) => {
    const { stop, newError } = validation.func(value, form, lastSubmitForm)
    setError((error) => ({ ...error, ...newError }))
    return stop
  })
}

export const useInternValue = <Value>(
  defaultValue: Value,
  value?: Value
): [Value, Dispatch<SetStateAction<Value>>] => {
  const [internValue, setInternValue] = useState<Value>(defaultValue)
  useEffect(() => {
    if (value !== undefined) {
      setInternValue(value)
    }
  }, [value])
  return [internValue, setInternValue]
}

export type ValueGetter<FormType> = {
  [key in keyof FormType]: (event: unknown) => FormType[key]
}

export type FormValidation<FormType> = {
  [key in keyof FormType]: Array<{
    func: ValidateFunc<FormType>,
    when: Array<ValidationTimePoint>
  }>
}

export type ChangedFormGetter<FormType> = Partial<{
  [key in keyof FormType]: (value: FormType[key], form: FormType) => FormType
}>

export type DisableFieldGetter<FormType> = Partial<{
  [key in keyof FormType]: (value: FormType[key], form: FormType) => boolean
}>

export interface SetAction<FormType> {
  type: 'set'
  value: FormType
}

export interface ChangeAction<FormType, Value> {
  type: 'change'
  label: keyof FormType
  value: Value
}

export interface OtherEventAction<FormType> {
  type: 'blur' | 'focus'
  label: keyof FormType
}

export interface SubmitAction {
  type: 'submit'
}

export interface FormState<FormType> {
  value: FormType
  dispatch: Dispatch<SetAction<FormType> | ChangeAction<FormType, any> | OtherEventAction<FormType> | SubmitAction>
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  handleChange: (label: keyof FormType) => (event: unknown) => void
  handleOther: (type: 'blur' | 'focus', label: keyof FormType) => () => void
  error: FormError<FormType>
  setError: Dispatch<SetStateAction<FormError<FormType>>>
  disableSubmit: boolean
  disabled: { [key in keyof FormType]: boolean }
  lastSubmitForm: FormType
}

export const createDefaultFormState = <FormType>(defaultValue: FormType): FormState<FormType> => ({
  value: defaultValue,
  dispatch: () => {},
  handleSubmit: (form) => form,
  handleChange: () => () => {},
  handleOther: () => () => {},
  error: {} as FormError<FormType>,
  setError: () => {},
  disableSubmit: true,
  disabled: {} as { [key in keyof FormType]: boolean },
  lastSubmitForm: defaultValue
})

export const useForm = <FormType>(options: {
  defaultValue: FormType
  onSubmit: (form: FormType) => FormType
  getValueFromEvent: ValueGetter<FormType>
  formValidation: FormValidation<FormType>
  getChangedForm?: ChangedFormGetter<FormType>
  disableField?: DisableFieldGetter<FormType>
}): FormState<FormType> => {
  const {
    defaultValue,
    onSubmit,
    getValueFromEvent,
    formValidation,
    getChangedForm,
    disableField
  } = options

  const initError = useMemo(() => {
    return Object.keys(defaultValue)
      .map((key) => ({ [key]: null }))
      .reduce((object, entry) => Object.assign({}, object, entry), {}) as FormError<FormType>
  }, [defaultValue])

  const [error, setError] = useState<FormError<FormType>>(initError)
  const [lastSubmitForm, setLastSubmitForm] = useState<FormType>(defaultValue)
  
  function valueReducer (
    state: FormType,
    action: SetAction<FormType> | ChangeAction<FormType, any> | OtherEventAction<FormType> | SubmitAction
  ) {
    const { type } = action
    if (type === 'set') {
      const { value } = action as SetAction<FormType>
      return value
    }
    if (type === 'blur') {
      const { label } = action as OtherEventAction<FormType>
      const validations = formValidation[label as keyof FormType]
        .filter((item) => item.when.includes('blur'))
      if (validations.length === 0) return state
      handleValidations(validations, state[label as keyof FormType], state, lastSubmitForm, setError)
      return state
    }
    if (type === 'focus') {
      const { label } = action as OtherEventAction<FormType>
      const validations = formValidation[label as keyof FormType]
        .filter((item) => item.when.includes('focus'))
      if (validations.length === 0) return state
      handleValidations(validations, state[label as keyof FormType], state, lastSubmitForm, setError)
      return state
    }
    if (type === 'change') {
      const { label, value } = action as ChangeAction<FormType, any>
      const validations = formValidation[label as keyof FormType]
        .filter((item) => item.when.includes('change'))
      if (getChangedForm !== undefined && getChangedForm[label as keyof FormType] !== undefined) {
        const changed = getChangedForm[label as keyof FormType]!(value, state)
        handleValidations(validations, changed[label as keyof FormType], changed, lastSubmitForm, setError)
        return changed
      }
      const changed = { ...state, [label]: value }
      handleValidations(validations, changed[label as keyof FormType], changed, lastSubmitForm, setError)
      return changed
    }
    if (type === 'submit') {
      const pass = Object.keys(state)
        .every((key) => {
          if (formValidation[key as keyof FormType] === undefined) return true
          return formValidation[key as keyof FormType]
            .filter((item) => item.when.includes('beforeSubmit'))
            .every((validation) => {
              const result = validation.func(state[key as keyof FormType], state, lastSubmitForm)
              if (result.isPass) {
                setError((error) => ({ ...error, ...result.newError }))
                return true
              }
              setError((error) => ({ ...error, ...result.newError }))
              return false
            })
        })
      if (pass) return onSubmit(state)
      return state
    }
    return state
  }

  const [value, dispatch] = useReducer(
    useCallback(valueReducer, [formValidation, getChangedForm, onSubmit, lastSubmitForm]),
    defaultValue
  )

  useEffect(() => dispatch({ type: 'set', value: defaultValue }), [defaultValue])

  const disableSubmit = useMemo(() => {
    return !Object.keys(value)
      .every((key) => {
        if (formValidation[key as keyof FormType] === undefined) return true
        return formValidation[key as keyof FormType]
          .filter((item) => item.when.includes('beforeClickSubmit'))
          .every((validation) => {
            return validation.func(value[key as keyof FormType], value, lastSubmitForm).isPass
              && error[key as keyof FormType] === null
          })
      })
  }, [value, error, formValidation, lastSubmitForm])

  useEffect(() => {
    Object.keys(value)
      .forEach((key) => {
        if (formValidation[key as keyof FormType] === undefined) return
        const validations = formValidation[key as keyof FormType]
          .filter((item) => item.when.includes('rerender'))
        if (validations.length === 0) return
        handleValidations(validations, value[key as keyof FormType], value, lastSubmitForm, setError)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, formValidation])

  const [handleDebouncedSubmit] = useDebouncedCallback(() => {
    setLastSubmitForm(value)
    dispatch({ type: 'submit' })
  }, 200)
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleDebouncedSubmit()
  }
  const handleChange = (label: keyof FormType) => (event: unknown) => dispatch({
    type: 'change',
    label,
    value: getValueFromEvent[label](event)
  })
  const handleOther = (type: 'blur' | 'focus', label: keyof FormType) => () => dispatch({ type, label })

  const disabled = useMemo(() => {
    return Object.keys(value)
      .map((key) => {
        if (disableField !== undefined && disableField[key as keyof FormType] !== undefined) {
          return { [key as keyof FormType]: disableField[key as keyof FormType]!(value[key as keyof FormType], value) }
        }
        return { [key as keyof FormType]: false }
      })
      .reduce((collection, item) => Object.assign({}, collection, item), {}) as { [key in keyof FormType]: boolean }
  }, [value, disableField])

  return {
    value,
    dispatch,
    handleSubmit,
    handleChange,
    handleOther,
    error,
    setError,
    disableSubmit,
    disabled,
    lastSubmitForm
  }
}
