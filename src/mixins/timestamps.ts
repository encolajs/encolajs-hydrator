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

  const originalFill = Class.prototype.fill
  if (originalFill) {
    Class.prototype.fill = function (data: any) {
      // Call the original fill method
      const result = originalFill.call(this, data)

      if (!this[createdAtField]) {
        this[createdAtField] = new Date()
      }

      this[updatedAtField] = new Date()

      return result
    }
  }
}
