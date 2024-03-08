export const createDict = (items: Array<any>, keyPropName = 'id') =>
  items.reduce((dict, item) => {
    return Object.assign(
      dict,
      typeof item === 'object'
        ? { [item[keyPropName]]: item }
        : { [item]: item }
    )
  }, {})

export const groupBy = (items: Array<any>, groupingKey: string) =>
  items.reduce((group, item) => {
    const key = item[groupingKey]

    if (!group[key]) {
      group[key] = []
    }

    group[key].push(item)

    return group
  }, {})

export const createOptions = (items: Array<any>) =>
  items.map(({ id, name }) => ({
    value: id,
    label: name,
  }))

export const createCodeOptions = (items: Array<any>) =>
  items.map(({ id, code }) => ({
    value: id,
    label: code,
  }))

export const createCodeNameOptions = (items: Array<any>) =>
  items.map(({ id, code, name }) => ({
    value: id,
    label: `${code} ${name}`,
  }))

export const range = (start: number, end: number, step = 1) => {
  const range = []

  for (let i = start; i < end; i += step) {
    range.push(i)
  }

  return range
}

export const transpose = (array: Array<Array<any>>) =>
  array[0].map((_, colIndex) => array.map((row) => row[colIndex]))

/**
 *
 * @param {Array} array
 * @returns {Array}
 */
export const flatten = (array: Array<any>): Array<any> =>
  array.reduce(
    (sqeezed, element) =>
      sqeezed.concat(Array.isArray(element) ? flatten(element) : element),
    []
  )

export const unwrap = (array: any) => (Array.isArray(array) ? array[0] : array)
