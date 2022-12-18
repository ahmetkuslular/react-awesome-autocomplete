export default class DomHandler {
  static findSingle(element, selector) {
    if (element) {
      return element.querySelector(selector)
    }

    return null
  }

  static getParents(element, parents = []) {
    return element['parentNode'] === null
      ? parents
      : this.getParents(element.parentNode, parents.concat([element.parentNode]))
  }

  static getScrollableParents(element) {
    let scrollableParents = []

    if (element) {
      let parents = this.getParents(element)
      const overflowRegex = /(auto|scroll)/

      const overflowCheck = (node) => {
        let styleDeclaration = node ? getComputedStyle(node) : null

        return (
          styleDeclaration &&
          (overflowRegex.test(styleDeclaration.getPropertyValue('overflow')) ||
            overflowRegex.test(styleDeclaration.getPropertyValue('overflowX')) ||
            overflowRegex.test(styleDeclaration.getPropertyValue('overflowY')))
        )
      }

      for (let parent of parents) {
        let scrollSelectors = parent.nodeType === 1 && parent.dataset['scrollselectors']

        if (scrollSelectors) {
          let selectors = scrollSelectors.split(',')

          for (let selector of selectors) {
            let el = this.findSingle(parent, selector)

            if (el && overflowCheck(el)) {
              scrollableParents.push(el)
            }
          }
        }

        if (parent.nodeType !== 9 && overflowCheck(parent)) {
          scrollableParents.push(parent)
        }
      }
    }

    return scrollableParents
  }

  static isTouchDevice() {
    return (
      'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    )
  }

  static appendChild(element, target) {
    if (this.isElement(target)) target.appendChild(element)
    else if (target.el && target.el.nativeElement) target.el.nativeElement.appendChild(element)
    else throw new Error('Cannot append ' + target + ' to ' + element)
  }

  static removeChild(element, target) {
    if (this.isElement(target)) target.removeChild(element)
    else if (target.el && target.el.nativeElement) target.el.nativeElement.removeChild(element)
    else throw new Error('Cannot remove ' + element + ' from ' + target)
  }

  static isElement(obj) {
    return typeof HTMLElement === 'object'
      ? obj instanceof HTMLElement
      : obj &&
          typeof obj === 'object' &&
          obj !== null &&
          obj.nodeType === 1 &&
          typeof obj.nodeName === 'string'
  }

  static isExist(element) {
    return (
      element !== null && typeof element !== 'undefined' && element.nodeName && element.parentNode
    )
  }

  static getTargetElement(target) {
    if (!target) return null

    if (target === 'document') {
      return document
    } else if (target === 'window') {
      return window
    } else if (typeof target === 'object' && target.hasOwnProperty('current')) {
      return this.isExist(target.current) ? target.current : null
    } else {
      const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply)
      const element = isFunction(target) ? target() : target

      return (element && element.nodeType === 9) || this.isExist(element) ? element : null
    }
  }
}
