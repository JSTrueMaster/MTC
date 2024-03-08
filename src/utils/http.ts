import { decamelizeKeys, camelizeKeys } from 'src/utils/object'

interface myQueryParams {
  [key: string] : any;
}
interface myParams {
  [key: string] : any;
}
export const filterQueryParams = (params : myParams) =>
  Object.keys(params).reduce((queryParams : myQueryParams, key) => {
    if (Array.isArray(params[key]) && params[key].length === 0) {
      return queryParams
    }

    if (!params[key] && params[key] !== 0) {
      return queryParams
    }

    return Object.assign(queryParams, {
      [key]: !Array.isArray(params[key])
        ? params[key]
        : params[key].filter((value: any) => Boolean(value) && value !== 0),
    })
  }, {})

export const normalizeArrayParams = (params : myParams) =>
  Object.keys(params).reduce((queryParams : myQueryParams, key : string) => {
    if (Array.isArray(params[key]) && key.substring(key.length - 2) !== '[]') {
      queryParams[`${key}[]`]  = params[key]
    } else {
      queryParams[key] = params[key]
    }

    return queryParams
  }, {})

export const denormalizeArrayParams = (params : myParams) =>
  Object.keys(params).reduce((queryParams : myQueryParams, key) => {
    if (key.substring(key.length - 2) === '[]') {
      queryParams[key.replace(/\[\]$/, '')] = !Array.isArray(params[key])
        ? [params[key]]
        : params[key]
    } else {
      queryParams[key] = params[key]
    }

    return queryParams
  }, {})

export const preprocessStringfyingQuery = (params : myParams) => {
  params = decamelizeKeys(params)

  params = normalizeArrayParams(params)

  return params
}

export const postprocessParsingQuery = (params : myParams) => {
  params = camelizeKeys(params)

  params = denormalizeArrayParams(params)

  return params
}
