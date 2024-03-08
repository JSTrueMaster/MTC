import decamelize from 'decamelize'

export const route = (template: any, params: any) =>
  '/' +
  Object.keys(params).reduce(
    (url, key) => url.replace(`{${decamelize(key)}}`, params[key]),
    template
  )
