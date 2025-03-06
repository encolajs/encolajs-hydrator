import { PropertySchema } from '../ClassBuilder'
export default function (Class: any, options: Record<string, string>) {
  let createdAtField: string = options?.createdAtField || 'created_at'
  let updatedAtField: string = options?.updatedAtField || 'updated_at'

  const props: Record<string, PropertySchema | string> = {}
  props[createdAtField] = 'date'
  props[updatedAtField] = 'date'

  this.applyPropsToClass(Class, props)

  Class.prototype.touch = function () {
    this[updatedAtField] = new Date()
    return this
  }

  const originalSetAttributes = Class.prototype.setAttributes
  if (originalSetAttributes) {
    Class.prototype.setAttributes = function (data: any) {
      // Call the original fill method
      const result = originalSetAttributes.call(this, data)

      if (!this[createdAtField]) {
        this[createdAtField] = new Date()
      }

      this[updatedAtField] = new Date()

      return result
    }
  }
}
