import { PropertySchema } from '../ClassBuilder'

export default function (Class: any, options: any = {}) {
  const deletedAtField: string = options?.deletedAtField || 'deleted_at'

  const props: Record<string, PropertySchema | string> = {}
  props[deletedAtField] = 'date'

  this.applyPropsToClass(Class, props)

  Class.prototype.delete = function () {
    this[deletedAtField] = new Date()
    if (typeof this.touch === 'function') {
      this.touch()
    }
    return this
  }

  Class.prototype.restore = function () {
    this[deletedAtField] = null
    if (typeof this.touch === 'function') {
      this.touch()
    }
    return this
  }

  Class.prototype.isDeleted = function () {
    return !!this[deletedAtField]
  }
}
