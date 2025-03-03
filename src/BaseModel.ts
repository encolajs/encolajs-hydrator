/**
 * BaseModel class with minimal implementation
 * Provides basic functionality for model-like objects
 */
export default class BaseModel {
  protected _idAttribute: string = 'id'
  // Internal data container
  protected _data: Record<string, any> = {}

  constructor(data: Record<string, any> | undefined | null = {}) {
    this.fill(data)
  }

  fill(data: Record<string, any> | undefined | null): this {
    if (!data || typeof data !== 'object') {
      return this
    }

    // Use property setters to ensure casting is applied
    Object.entries(data).forEach(([key, value]) => {
      if (Object.getOwnPropertyDescriptor(this.constructor.prototype, key)) {
        // This will trigger property setters if they exist
        ;(this as any)[key] = value
      } else {
        // For properties not defined in the class, store directly in _data
        this._data[key] = value
      }
    })

    return this
  }

  theId(): unknown {
    return (
      (this as any)[this._idAttribute] || this._data[this._idAttribute] || null
    )
  }

  toJSON(): Record<string, any> {
    const result: Record<string, any> = {}

    // Get all property names, including those from prototype
    const propNames = new Set([
      ...Object.keys(this._data || {}),
      ...Object.getOwnPropertyNames(this).filter(
        (prop) =>
          prop !== 'constructor' &&
          prop !== 'toJSON' &&
          prop !== 'clone' &&
          !prop.startsWith('_')
      ),
    ])

    // Add each property to result
    propNames.forEach((prop) => {
      // Skip methods and internal properties
      if (typeof (this as any)[prop] === 'function' || prop.startsWith('_')) {
        return
      }

      result[prop] = (this as any)[prop]
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
