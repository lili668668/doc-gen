import yaml from 'yaml'
import { isNumber, isInteger, isBoolean, isString, isObject, isArray, omitBy, isUndefined } from 'lodash-es'
import { parse } from 'comment-json'
import { PresentationProps, PlatForm } from '../components/Presentation'

export const getUrl = (platform: PlatForm, path: string): string => {
  let prefix = '/'
  switch(platform) {
  case 'COMMON':
    prefix = '/'
    break
  case 'AGENT':
    prefix = '/agent/v1'
    break
  case 'ADMIN':
    prefix = '/admin/v1'
    break
  }
  return `${prefix}${path}`
}

export const parseJSON = (str: string) => {
  try {
    return parse(str)
  } catch {
    return {}
  }
}

export const getPathParameters = (path: string): Array<{
  in: string
  name: string
  schema: { type: string }
  required: boolean
}> => {
  return path
    .split('/')
    .filter((item) => item.includes('{') && item.includes('}'))
    .map((item) => item.replace(/[{}]/gi, ''))
    .map((name) => ({
      in: 'path',
      name,
      schema: {
        type: 'string'
      },
      required: true
    }))
}

export const getType = (value: any): string => {
  if (isInteger(value)) {
    return 'integer'
  } else if (isNumber(value)) {
    return 'float'
  } else if (isString(value)) {
    return 'string'
  } else if (isBoolean(value)) {
    return 'boolean'
  } else if (isArray(value)) {
    return 'array'
  } else if (isObject(value)) {
    return 'object'
  }
  return ''
}

export const getCommentString = (query: any, id: string): string => {
  console.log(query)
  const beforeSymbols = query[Symbol.for(`before:${id}`)]
  const comments: string[] = beforeSymbols ? beforeSymbols.map((comment: any) => comment.value) : []
  return comments.reduce((all, comment) => `${all}${comment.trim()}\n`, '').trim()
}

export const getItems = (value: any[]): { type: string, items?: any, properties?: any } => {
  const type = getType(value[0])
  const data = {
    type,
    items: type === 'array' ? getItems(value[0]) : undefined,
    properties: type === 'object' ? getProperties(value[0]) : undefined
  }
  return omitBy(data, isUndefined) as { type: string, items?: any, properties?: any }
}

export const getProperties = (value: any): any => {
  return Object.keys(value)
    .map((key) => {
      const type = getType(value[key])
      const data = {
        description: getCommentString(value, key),
        type,
        items: type === 'array' ? getItems(value[key]) : undefined,
        properties: type === 'object' ? getProperties(value[key]) : undefined
      }
      return {
        [key]: omitBy(data, isUndefined)
      }
    })
    .reduce((collection, item) => Object.assign({}, collection, item), {})
}

export const getQueryParameters = (query: string): Array<{
  in: string
  name: string
  description: string
  type: string
  items?: { type: string, properties?: any }
  properties?: any
}> => {
  const queryWithComment = parseJSON(query)
  return Object.keys(queryWithComment)
    .map((name) => {
      const type = getType(queryWithComment[name])
      const data = {
        in: 'query',
        name,
        description: getCommentString(queryWithComment, name),
        type,
        items: type === 'array' ? getItems(queryWithComment[name]) : undefined,
        properties: type === 'object' ? getProperties(queryWithComment[name]) : undefined
      }
      return omitBy(data, isUndefined) as {
        in: string
        name: string
        description: string
        type: string
        items?: { type: string, properties?: any }
        properties?: any
      }
    })
}

export const getRequestBody = (request: string): {
  content: {
    'application/json': {
      schema: {
        examples: any
        type: string
        items?: any
        properties?: any
      }
    }
  }
} => {
  const requestWithComment = parseJSON(request)
  const type = getType(requestWithComment)
  const data = {
    type,
    items: type === 'array' ? getItems(requestWithComment) : undefined,
    properties: type === 'object' ? getProperties(requestWithComment) : undefined,
    examples: requestWithComment
  }
  return {
    content: {
      'application/json': {
        schema: omitBy(data, isUndefined) as {
          examples: any
          type: string
          items?: any
          properties?: any
        }
      }
    }
  }
}

export const getResponseBody = (response: string, code: string) => {
  const responseWithComment = parseJSON(response)
  const type = getType(responseWithComment)
  const data = {
    type,
    items: type === 'array' ? getItems(responseWithComment) : undefined,
    properties: type === 'object' ? getProperties(responseWithComment) : undefined,
    examples: responseWithComment
  }
  let schema = {}
  const comment = responseWithComment[Symbol.for('before-all')]
  if (comment !== undefined) {
    const ref = comment[0].value.replace('ref:', '').trim()
    schema = {
      allOf: [
        omitBy(data, isUndefined),
        {
          '$ref': ref
        }
      ]
    }
  } else {
    schema = omitBy(data, isUndefined)
  }
  if (code === '204') {
    return {
      [code]: {
        description: "No Content"
      }
    }
  }
  return {
    [code]: {
      content: {
        'application/json': {
          schema
        }
      }
    }
  }
}

export const toYaml = (value: PresentationProps): string => {
  const url = getUrl(value.platform, value.path)
  const data = {
    summary: url,
    description: `Assignee: ${value.assignee}\n${value.description}`,
    tags: [value.tag],
    security: [{ JWT: [] }],
    operationId: url.replace(/\//gi, '.').slice(1),
    parameters: getPathParameters(url).concat(getQueryParameters(value.query) as any),
    requestBody: value.request === '' ? undefined : getRequestBody(value.request),
    responses: getResponseBody(value.response, value.responseCode)
  }
  const api = {
    paths: {
      [url]: {
        [value.method.toLowerCase()]: omitBy(data, isUndefined)
      }
    }
  }
  return yaml.stringify(api)
}
