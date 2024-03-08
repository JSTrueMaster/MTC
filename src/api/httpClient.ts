import qs from 'qs'
import axios from 'axios'
import merge from 'lodash.merge'
import { decamelizeKeys, camelizeKeys } from 'src/utils/object'
import { preprocessStringfyingQuery } from 'src/utils/http'
import * as httpStatusCode from 'src/constants/httpStatusCode'
import Jwt from 'src/services/jwt'

import { API_URL } from '../configs/AppConfig'
import { redirect } from 'react-router-dom'

const BASE_API_URL = API_URL

const normalizeValidationErrorKeys = (data: any) => {
  if (!data.errors || typeof data.errors !== 'object') {
    return data
  }

  Object.keys(data.errors).forEach((key) => {
    if (!String(key).includes('.')) {
      return
    }

    const groupKey = key.split('.')[0]

    if (!data.errors[groupKey]) {
      data.errors[groupKey] = []
    }

    if (!Array.isArray(data.errors[groupKey])) {
      data.errors[groupKey] = [data.errors[groupKey]]
    }

    data.errors[groupKey].push(...data.errors[key])
  })

  return data
}

interface ConfigType {
  headers: {
    [key: string]: any
  };
  urlPrefix?: string;
  maxContentLength?: number;
}

interface OptionsType {
  decamelizeRequest?: boolean;
  camelizeResponse?: boolean;
  query?: any;
  withHeaders?: boolean;
}

export default class HttpClient {
  config: ConfigType
  httpClient: any
  urlPrefix: string

  constructor(config = {} as ConfigType) {
    this.config = {
      headers: {
        "Content-type": "application/json",
      },
      maxContentLength: 2000 * 1024 * 1024 
    }

    if (Jwt.token()) {
      this.setHeader("x-access-token", Jwt.token());
    }else redirect('/auth/login'); 

    this.httpClient = axios.create()

    const urlPrefix = config.urlPrefix ?? 'api'
    this.urlPrefix = urlPrefix.startsWith('/')
      ? urlPrefix.substring(1)
      : urlPrefix
  }

  setHeader(name: string, value: any) {
    this.config.headers[name] = value
  }

  removeHeader(name: string) {
    delete this.config.headers[name]
  }

  fetch(url: string, config = {} as ConfigType, options = {}) {
    return this.request({ method: 'get', url }, config, options)
  }

  post(url: string, data = {}, config = {} as ConfigType, options = {}) {
    return this.request({ method: 'post', url, data }, config, options)
  }

  put(url: string, data = {}, config = {} as ConfigType, options = {}) {
    return this.request({ method: 'put', url, data }, config, options)
  }

  patch(url: string, data = {}, config = {} as ConfigType, options = {}) {
    return this.request({ method: 'patch', url, data }, config, options)
  }

  delete(url: string, config = {} as ConfigType, options = {}) {
    return this.request({ method: 'delete', url }, config, options)
  }

  request(request: any, config: ConfigType, options = {} as OptionsType, retry = false) {
    const {
      decamelizeRequest = false,
      camelizeResponse = true,
      query = {},
      withHeaders = true,
    } = options

    if (!retry) {
      const { url } = request
      const encodedQuery =
        Object.keys(query).length > 0
          ? qs.stringify(preprocessStringfyingQuery(query))
          : ''
      const urlPrefix = config.urlPrefix ?? this.urlPrefix

      request.url = [BASE_API_URL, urlPrefix, url]
        .filter((part) => part)
        .join('/')

      if (encodedQuery) {
        request.url += '?' + encodedQuery
      }

      if (decamelizeRequest && request.data) {
        request.data = decamelizeKeys(request.data)
      }
    }

    return this.httpClient
      .request(merge({}, this.config, config, request))
      .then((response: any) => (withHeaders ? response : response.data))
      .then((data: any) => (camelizeResponse ? camelizeKeys(data) : data))
      .catch((error: any) =>
        this.handleError(error, { request, config, options }, retry)
      )
  }

  // eslint-disable-next-line no-unused-vars
  async handleError(error: any, requestParams: any, retry: any) {
    if (!error.isAxiosError) {
      throw error
    }

    const { status } = error.response

    switch (status) {
      case httpStatusCode.UNAUTHORIZED:
        Jwt.logout()
        window.location.reload()
        break
      case httpStatusCode.UNPROCESSABLE_ENTITY:
        error.response.data = camelizeKeys(
          normalizeValidationErrorKeys(error.response.data)
        )
        break
      default:
        break
    }

    throw error
  }

  // eslint-disable-next-line no-unused-vars
  async handleUnauthenticatedError(error: any, requestParams: any, retry: any) {
    throw error
  }

  retryRequest(requestParams: any) {
    const { request, config, options } = requestParams

    return this.request(request, config, options, true)
  }
}
