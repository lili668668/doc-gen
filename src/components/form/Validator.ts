import { FormError } from './FormHelper'

export type Result<FormType> = {
  isPass: boolean,
  stop: boolean,
  newError: Partial<FormError<FormType>>
}

export type ValidateFunc<FormType> = (value: unknown, form: FormType, lastSubmitForm: FormType) => Result<FormType>

export type ValidationTimePoint = 'blur'
  | 'focus'
  | 'change'
  | 'beforeClickSubmit'
  | 'beforeSubmit'
  | 'rerender'

export function createCorrectResult<FormType> (label: keyof FormType): Result<FormType> {
  return {
    isPass: true,
    stop: false,
    newError: { [label]: null } as Partial<FormError<FormType>>
  }
}

export function createErrorResult<FormType> (label: keyof FormType, text: string): Result<FormType> {
  return {
    isPass: false,
    stop: true,
    newError: { [label]: text } as Partial<FormError<FormType>>
  }
}

export function createValidateNotEmpty<FormType> (
  label: keyof FormType
): ValidateFunc<FormType> {
  return (value: unknown) => {
    if (value !== undefined && value !== null && value as string !== '') {
      return createCorrectResult(label)
    }
    return createErrorResult(label, 'required')
  }
}

export function createValidateRange<FormType> (
  label: keyof FormType,
  getNumber: (value: unknown) => number,
  mustCondition: 'lessThan' | 'moreThan' | 'lessEqual' | 'moreEqual' | 'equal' | 'notEqual',
  boundary: number,
  errorText: string
): ValidateFunc<FormType> {
  return (value: unknown) => {
    const num = getNumber(value)
    switch (mustCondition) {
    case 'lessThan':
      if (num < boundary) {
        return createCorrectResult(label)
      }
      break
    case 'moreThan':
      if (num > boundary) {
        return createCorrectResult(label)
      }
      break
    case 'lessEqual':
      if (num <= boundary) {
        return createCorrectResult(label)
      }
      break
    case 'moreEqual':
      if (num >= boundary) {
        return createCorrectResult(label)
      }
      break
    case 'equal':
      if (num === boundary) {
        return createCorrectResult(label)
      }
      break
    case 'notEqual':
      if (num !== boundary) {
        return createCorrectResult(label)
      }
      break
    }
    return createErrorResult(label, errorText)
  }
}
