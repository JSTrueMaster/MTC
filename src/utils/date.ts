import moment from 'moment'

interface Age {
  years: number;
  months: number;
}
export const between = (target: any, [from, to]: [any, any]) =>
  moment(target).diff(from) >= 0 && moment(target).diff(to) <= 0

export const computeAge = (date: any, basisDate = moment()) => {
  const totalMonths = moment(basisDate).diff(date, 'month')
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  return { years, months }
}

export const formatAge = ({ years, months }: Age) => `${years}年${months}ヶ月`

export const computeFormattedAge = (date: any, basisDate = moment()) =>
  formatAge(computeAge(date, basisDate))

export const formatDate = (dateString: string, type: string) => {
  const dateArr = dateString.split('/')
  let date = ("0" + dateArr[0]).slice(-2);
  let month = ("0" + dateArr[1]).slice(-2);
  let year = dateArr[2];
  return (date + type + month + type + year)
}
