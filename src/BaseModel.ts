/**
 * BaseModel class with minimal implementation
 * Provides basic functionality for model-like objects
 */
export default class BaseModel {
  protected _idAttribute: string = 'id'
  // Internal data container
  protected _data: Record<string, any> = {}

  constructor(data: Record<string, any> | undefined | null = {}) {
    this.setAttributes(data)
  }

  setAttributes(attributes: Record<string, any> | undefined | null): this {
    if (!attributes || typeof attributes !== 'object') {
      return this
    }

    Object.entries(attributes).forEach(([key, value]) => {
      this.setAttribute(key, value)
    })

    return this
  }

  getAttributes(): Record<string, any> {
    return this._data
  }

  getAttribute(key: string): any {
    if (this._data[key] === undefined) {
      this.setAttribute(key, null)
    }
    // Check for a custom getter method
    const getterMethod = `_get_${key}`
    if (typeof (this as any)[getterMethod] === 'function') {
      return (this as any)[getterMethod]()
    }

    return this._data[key]
  }

  setAttribute(key: string, value: any): this {
    // Check for a custom setter method
    const setterMethod = `_set_${key}`
    if (typeof (this as any)[setterMethod] === 'function') {
      ;(this as any)[setterMethod](value)
      return this
    }

    this._data[key] = this.castAttribute(key, value)
    return this
  }

  castAttribute(key: string, value: any): any {
    const casterMethod = `_cast_${key}`
    if (typeof (this as any)[casterMethod] === 'function') {
      return (this as any)[casterMethod](value)
    }

    return value
  }

  serializeAttribute(key: string): any {
    // Check for a custom serializer method
    const serializerMethod = `_serialize_${key}`
    if (typeof (this as any)[serializerMethod] === 'function') {
      return (this as any)[serializerMethod]()
    }

    return this._data[key]
  }

  theId(): unknown {
    return (
      (this as any)[this._idAttribute] || this._data[this._idAttribute] || null
    )
  }

  toJSON(): Record<string, any> {
    const result: Record<string, any> = {}

    // Get all property names, including those from prototype
    const propNames = new Set([...Object.keys(this._data || {})])

    // Add each property to result
    propNames.forEach((prop) => {
      // Skip methods and internal properties
      if (typeof (this as any)[prop] === 'function' || prop.startsWith('_')) {
        return
      }

      result[prop] = this.serializeAttribute(prop)
    })

    return result
  }

  clone(): BaseModel {
    // Create a new instance of the same class
    const Constructor = this.constructor as typeof BaseModel

    // First serialize to ensure we have plain objects without references
    const serializedData = this.toJSON()

    // Create a new instance with the same data
    return new Constructor(serializedData)
  }
}
