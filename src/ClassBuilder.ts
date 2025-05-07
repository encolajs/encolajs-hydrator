import CastingManager from './CastingManager'
import BaseModel from './BaseModel'
import BaseCollection from './BaseCollection'
import timestamps from './mixins/timestamps'
import softDelete from './mixins/softDelete'
import methods from './mixins/methods'
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
  private currentClass: any = null
  constructor(castingManager: CastingManager) {
    this.castingManager = castingManager
    this.mixins = new Map()
    this.registerBuiltInMixins()
  }

  withClass(Class: any): this {
    this.currentClass = Class
    return this
  }

  private applyPropsToClass(
    Class: any,
    props: Record<string, string | PropertySchema>
  ): any {
    const castingManager = this.castingManager

    Class.prototype._data = Class.prototype._data || {}

    Class.prototype._propertyTypes = Class.prototype._propertyTypes || {}

    Object.entries(props).forEach(([prop, typeSpec]) => {
      const spec = normalizePropertySchema(typeSpec)
      Class.prototype._propertyTypes[prop] = spec.type

      Class.prototype._propertyTypes[prop] = spec.type

      if (spec.get) {
        Class.prototype[`_get_${prop}`] = spec.get
      }

      if (spec.set) {
        Class.prototype[`_get_${prop}`] = spec.set
      }

      if (spec.type !== 'any') {
        Class.prototype[`_cast_${prop}`] = function (value: any) {
          return castingManager.hasCaster(spec.type) ? castingManager.cast(value, spec.type) : value
        }
      }

      if (spec.type !== 'any') {
        Class.prototype[`_serialize_${prop}`] = function () {
          return castingManager.hasSerializer(spec.type) ? castingManager.serialize(this._data[prop], spec.type) : this._data[prop]
        }
      }

      // Define the property getters/setters that always use getAttribute/setAttribute
      const getter = function (this: any) {
        return this.getAttribute(prop)
      }

      const setter = function (this: any, value: any) {
        this.setAttribute(prop, value)
      }

      Object.defineProperty(Class.prototype, prop, {
        get: getter as () => any,
        set: setter as (v: any) => void,
        enumerable: !!spec.enumerable,
        configurable: !!spec.configurable,
      })
    })

    Class.prototype.toJSON = function () {
      const result: Record<string, any> = {}
      const propertyTypes = this._propertyTypes || {}

      // Get all property names from own properties and prototype
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
        if (typeof (this as any)[prop] === 'function' || prop.startsWith('_')) {
          return
        }

        const propType = propertyTypes[prop]
        result[prop] = propType
          ? castingManager.serialize(this[prop], propType)
          : this[prop]
      })

      return result
    }

    return Class
  }

  registerMixin(name: any, fn: Function): this {
    this.mixins.set(name, fn)
    return this
  }

  add(mixinName: string, options?: any): this {
    if (!this.currentClass) {
      throw new Error('You must call withClass() before adding mixins')
    }

    if (mixinName === 'props' && options) {
      this.applyPropsToClass(this.currentClass, options)
    } else {
      const mixin = this.mixins.get(mixinName)
      if (!mixin) {
        throw new Error(`Mixin '${mixinName}' not found`)
      }

      mixin.call(this, this.currentClass, options)
    }

    return this
  }

  build(): any {
    if (!this.currentClass) {
      throw new Error('You must call withClass() before building')
    }

    const resultClass = this.currentClass
    this.currentClass = null
    return resultClass
  }

  newModelClass(
    props: Record<string, string | PropertySchema>,
    mixins: Record<string, any> = {},
    methods: Record<string, Function> = {}
  ): typeof BaseModel {
    // Create a new class extending BaseModel
    class CustomModel extends BaseModel {
      constructor(data: Record<string, any> = {}) {
        super(data)
      }
    }

    this.withClass(CustomModel).add('props', props).add('methods', methods)

    Object.entries(mixins).forEach(([name, options]) => {
      this.add(name, options)
    })

    return this.build()
  }

  newCollectionClass<T extends BaseModel>(
    ModelClass: new (data?: Record<string, any>) => T,
    mixins: Record<string, any> = {},
    methods: Record<string, Function> = {}
  ): typeof BaseCollection {
    // Create item casting function
    const castItem = (item: any): T => {
      if (item instanceof ModelClass) {
        return item
      }
      return new ModelClass(item)
    }

    // Create a custom collection class
    class CustomCollection<T> extends BaseCollection<T> {
      constructor(items: any[] = []) {
        super(items, castItem as any)
      }
    }

    this.withClass(CustomCollection).add('methods', methods)

    Object.entries(mixins).forEach(([name, options]) => {
      this.add(name, options)
    })

    return this.build() as unknown as typeof BaseCollection
  }

  private registerBuiltInMixins() {
    this.registerMixin('methods', methods)
    this.registerMixin('timestamps', timestamps)
    this.registerMixin('softDelete', softDelete)
  }
}
