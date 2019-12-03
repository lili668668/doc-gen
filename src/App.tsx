import React, { createContext } from 'react'
import { ThemeProvider, createMuiTheme } from '@material-ui/core'
import yellow from '@material-ui/core/colors/yellow'
import orange from '@material-ui/core/colors/orange'
import CssBaseline from '@material-ui/core/CssBaseline'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField'
import DropDown, { DropDownProps } from './components/form/DropDown'
import Editor, { EditorProps } from './components/form/Editor'
import { FormState, createDefaultFormState } from './components/form/FormHook'
import FormStateProvider from './components/form/FormStateProvider'
import { getValueFromChangeEvent, getValueFromValue } from './components/form/FormHelper'
import FormField from './components/form/FormField'
import Presentation, { PresentationProps } from './components/Presentation'

const initialForm = (defaultFrom?: PresentationProps): PresentationProps => ({
  platform: 'COMMON',
  assignee: '',
  path: '',
  method: 'GET',
  description: '',
  tag: '',
  query: '',
  request: '',
  response: '',
  ...defaultFrom
})

const FormContext = createContext<FormState<PresentationProps>>(createDefaultFormState(initialForm()))

const methodOptions = [
  { name: 'get', value: 'GET' },
  { name: 'post', value: 'POST' },
  { name: 'put', value: 'PUT' },
  { name: 'delete', value: 'DELETE' }
]

const platformOptions = [
  { name: 'common (通用，或前台)', value: 'COMMON' },
  { name: 'agent（代理後台）', value: 'AGENT' },
  { name: 'admin（總後台）', value: 'ADMIN' }
]

const TextField = React.memo(MuiTextField)

const App: React.FC = () => {
  const theme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: yellow,
      secondary: orange
    }
  })
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FormStateProvider
        context={FormContext}
        defaultValue={initialForm()}
        getValueFromEvent={{
          platform: getValueFromChangeEvent,
          assignee: getValueFromChangeEvent,
          path: getValueFromChangeEvent,
          method: getValueFromChangeEvent,
          description: getValueFromChangeEvent,
          tag: getValueFromChangeEvent,
          query: getValueFromValue,
          request: getValueFromValue,
          response: getValueFromValue
        }}
        validation={{
          platform: [],
          assignee: [],
          path: [],
          method: [],
          description: [],
          tag: [],
          query: [],
          request: [],
          response: []
        }}
        onSubmit={(form) => form}
      >
        <Box padding={4}>
          <Grid container direction="row" spacing={4}>
            <Grid item xs={6}>
              <Grid container direction="column" spacing={4}>
              <Grid item>
                  <FormField<PresentationProps, DropDownProps>
                    autoFocus
                    fullWidth
                    context={FormContext}
                    component={DropDown}
                    label="前綴"
                    name="platform"
                    options={platformOptions}
                  />
                </Grid>
                <Grid item>
                  <FormField<PresentationProps, TextFieldProps>
                    fullWidth
                    context={FormContext}
                    component={TextField}
                    label="負責人"
                    name="assignee"
                  />
                </Grid>
                <Grid item>
                  <FormField<PresentationProps, TextFieldProps>
                    fullWidth
                    context={FormContext}
                    component={TextField}
                    label="path"
                    name="path"
                  />
                </Grid>
                <Grid item>
                  <FormField<PresentationProps, DropDownProps>
                    fullWidth
                    context={FormContext}
                    component={DropDown}
                    label="method"
                    name="method"
                    options={methodOptions}
                  />
                </Grid>
                <Grid item>
                  <FormField<PresentationProps, TextFieldProps>
                    fullWidth
                    multiline
                    context={FormContext}
                    component={TextField}
                    label="描述"
                    name="description"
                  />
                </Grid>
                <Grid item>
                  <FormField<PresentationProps, TextFieldProps>
                    fullWidth
                    context={FormContext}
                    component={TextField}
                    label="分類"
                    name="tag"
                  />
                </Grid>
                <Grid item>
                  <FormField<PresentationProps, EditorProps>
                    context={FormContext}
                    component={Editor}
                    name="query"
                    label="Query Parameter Example"
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <FormContext.Consumer>
                {(formState) => {
                  const { value } = formState
                  return (<Presentation {...value} />)
                }}
              </FormContext.Consumer>
            </Grid>
          </Grid>
        </Box>
      </FormStateProvider>
    </ThemeProvider>
  )
}

export default App
