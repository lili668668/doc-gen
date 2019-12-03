import yaml from 'yaml'
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

/*export const getQueryParameters = (query: string): Array<{
  in: string
  name: string
  description: string

}>*/

export const toYaml = (value: PresentationProps): string => {
  try {
    console.log(parse(value.query))
  } catch {}
  const url = getUrl(value.platform, value.path)
  const api = {
    paths: {
      [url]: {
        [value.method.toLowerCase()]: {
          summary: url,
          description: `Assignee: ${value.assignee}\n${value.description}`,
          tags: [value.tag],
          security: [{ JWT: [] }],
          operationId: url.replace(/\//gi, '.').slice(1),
          parameters: getPathParameters(url)
        }
      }
    }
  }
  return yaml.stringify(api)
}
