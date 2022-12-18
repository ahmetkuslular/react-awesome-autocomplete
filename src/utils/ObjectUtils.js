export default class ObjectUtils {
  static isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (!(value instanceof Date) && typeof value === 'object' && Object.keys(value).length === 0)
    )
  }

  static isNotEmpty(value) {
    return !this.isEmpty(value)
  }
}
