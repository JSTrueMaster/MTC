import decamelize from 'decamelize'
import camelcase from './camelcase'

interface Options {
  valueName?: string,
  keyName?: string
}

const objectKeyProcessor = (strategy: any, params: any, depth = 10, count = 0): any => {
  if (count > depth) {
    return params
  }

  if (!isObject(params)) {
    return params
  }

  return Object.keys(params).reduce((processed, key) => {
    let value

    if (isObject(params[key])) {
      value = objectKeyProcessor(strategy, params[key], depth, count + 1)
    } else if (Array.isArray(params[key])) {
      value = params[key].map((value: any) =>
        isObject(value)
          ? objectKeyProcessor(strategy, value, depth, count + 1)
          : value
      )
    } else {
      value = params[key]
    }

    return {
      ...processed,
      [strategy(key)]: value,
    }
  }, {})
}

export const decamelizeKeys = (params: any, depth = 10) =>
  objectKeyProcessor(decamelize, params, depth)

export const camelizeKeys = (params: any, depth = 10) =>
  objectKeyProcessor(camelcase, params, depth)

export const arr2Kv = (srcArray: Array<any>, options = {}) => {
  const { valueName = 'value', keyName = 'key' }: Options = options

  return srcArray.reduce(
    (kv, item) => ({
      ...kv,
      [camelcase(item[keyName])]: item[valueName],
    }),
    {}
  )
}

interface object_i {
  [key: string]: any,

}
export const isObject = (value: any) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * @param {Object} object1
 * @param {Object} object2
 *
 * @returns {Object}
 */
export const assign = (object1 = {} as object_i, object2 = {} as object_i) => {
  Object.keys(object1).forEach((key) => {
    object1[key] = object2[key]
  })

  return object1
}

export const empty = (object = {} as object_i) => !object || Object.keys(object).length === 0

export const localize = (object = {} as object_i, key: any, locale = 'ja') => object?.[camelcase(`${locale}_${key}`)] || ''
