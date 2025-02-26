import CastingManager from './CastingManager'
export interface PropertySchema {
  type: string
  computed?: boolean
  get?: (instance: any) => any
  set?: (instance: any, value: any) => void
  enumerable?: boolean
  configurable?: boolean
}
function normalizePropertySchema(
  typeInfo: string | PropertySchema
): PropertySchema {
  return typeof typeInfo === 'string' ? { type: typeInfo } : typeInfo
}

export default class ClassBuilder {
  private readonly castingManager: CastingManager
  private mixins: Map<string, any>
  constructor(castingManager: CastingManager) {
    this.castingManager = castingManager
    this.mixins = new Map()
  }

  addProps(Class: any, props: Record<string, string | PropertySchema>): any {
    const castingManager = this.castingManager

    Class.prototype._data = {}

    Object.entries(props).forEach(([prop, typeSpec]) => {
      const spec = normalizePropertySchema(typeSpec)
      // Use arrow functions to avoid 'this' issues
      const getter =
        spec.get ||
        function (this: any) {
          return this._data[prop]
        }

      const setter =
        spec.set ||
        function (this: any, value: any) {
          this._data[prop] = castingManager.cast(value, spec.type)
        }

      Object.defineProperty(Class.prototype, prop, {
        get: getter as () => any,
        set: setter as (v: any) => void,
        enumerable: !!spec.enumerable,
        configurable: !!spec.configurable,
      })
    })

    if (!Class.prototype.toJSON) {
      Class.prototype.toJSON = function () {
        const result: Record<string, any> = {}

        // Get all property names from own properties and prototype
        const propNames = new Set([
          ...Object.keys(this._data || {}),
          ...Object.getOwnPropertyNames(Class.prototype).filter(
            (prop) => prop !== 'constructor' && prop !== 'toJSON'
          ),
        ])

        // Add each property to result
        propNames.forEach((prop) => {
          const propType = props[prop]
            ? normalizePropertySchema(props[prop]).type
            : null
          result[prop] = propType
            ? castingManager.serialize(this[prop], propType)
            : this[prop]
        })

        return result
      }
    }

    return Class
  }

  mixin(name: any, fn: Function): any {
    this.mixins.set(name, fn)
    return this
  }

  apply(Class: any, mixinName: string, ...args: any[]): any {
    const mixin = this.mixins.get(mixinName)
    if (!mixin) {
      throw new Error(`Mixin '${mixinName}' not found`)
    }

    mixin.call(this, Class, ...args)
    return Class
  }
}
