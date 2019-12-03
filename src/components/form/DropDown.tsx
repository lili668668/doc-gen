import React from 'react'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import FormHelperText from '@material-ui/core/FormHelperText'
import { useInternValue } from './FormHook'

export interface DropDownProps {
  label: string
  value?: string | number | string[] | undefined
  defaultValue?: string | number | string[] | undefined
  onChange?: (event: React.ChangeEvent<{
    name?: string | undefined
    value: unknown
  }>) => void
  options: Array<{
    name: string
    value: string | number | string[] | undefined
  }>
  disabled?: boolean
  fullWidth?: boolean
  placeholder?: string
  onBlur?: () => void
  onFocus?: () => void
  helperText?: string
  error?: boolean
  autoFocus?: boolean
  variant?: 'standard' | 'outlined' | 'filled'
  margin?: 'none' | 'dense'
}

const DropDown: React.FC<DropDownProps> = (props) => {
  const {
    label,
    value,
    defaultValue,
    onChange,
    disabled,
    fullWidth,
    placeholder,
    options,
    onBlur,
    onFocus,
    helperText,
    error,
    autoFocus,
    variant,
    margin
  } = props

  const [internValue, setInternValue] = useInternValue<string | number | string[] | undefined>(
    defaultValue || value,
    value
  )

  const selectValue = options.map((option) => option.value).includes(internValue) ? internValue : ''

  return (
    <FormControl
      fullWidth={fullWidth}
      disabled={disabled}
      onBlur={onBlur}
      onFocus={onFocus}
      error={error}
    >
      <InputLabel>{ label }</InputLabel>
      <Select
        variant={variant || 'standard'}
        placeholder={placeholder}
        value={selectValue}
        onChange={(event) => {
          setInternValue(event.target.value as string | number | string[] | undefined)
          if (onChange) onChange(event)
        }}
        autoFocus={autoFocus}
        margin={margin}
      >
        {options.map((option, index) => (
          <MenuItem key={index} value={option.value}>{option.name}</MenuItem>
        ))}
      </Select>
      {helperText && (<FormHelperText>{helperText}</FormHelperText>)}
    </FormControl>
  )
}

export default React.memo(DropDown)
