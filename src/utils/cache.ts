export const KEY_ACCOUNT_LINE_CHART = 'accontLineChart'
export const KEY_ACCONT_RANK = 'accontRank'

interface MyObject {
  [key: string]: any;
}

export default {
  cache: {} as MyObject,

  set(key: string, value: any, keepSeconds = 1800) {
    if (!keepSeconds || keepSeconds <= 0) {
      return this
    }

    this.cache[key] = value

    setTimeout(() => {
      delete this.cache[key]
    }, keepSeconds * 1000)

    return this
  },

  get(key: string) {
    return this.cache[key]
  },

  async wrap(key: string, process: any, keepSeconds = 1800) {
    const cached = this.get(key)

    if (cached !== undefined) {
      return cached
    }

    const newValue = await process()

    this.set(key, newValue, keepSeconds)

    return this.get(key)
  },
}
