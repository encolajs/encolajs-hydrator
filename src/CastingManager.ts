import BaseModel from './BaseModel'
import BaseCollection from './BaseCollection'

type CastFunction = (this: CastingManager, value: any, params?: string[]) => any
type SerializeFunction = (
  this: CastingManager,
  value: any,
  params?: string[]
) => any

function isNullable(value: any) {
  return value === null || value === undefined
}

// Built-in casters with serialization support
function asNumber(value: any) {
  if (isNullable(value)) {
    return null
  }
  if (typeof value === 'number') return value
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

function asDecimal(value: any, params: string[] = ['2']) {
  if (isNullable(value)) {
    return null
  }
  const precision = parseInt(params[0] || '2', 10)
  const num = parseFloat(value)
  return isNaN(num) ? 0 : Number(num.toFixed(precision))
}

function asInteger(value: any): number | null {
  return asDecimal(value, ['0'])
}

function asBoolean(value: any) {
  return !!value
}
function asString(value: any) {
  return value === null || value === undefined ? null : String(value)
}

const asArray: CastFunction = function (
  value: any[],
  params: string[] = []
): any[] {
  if (!Array.isArray(value)) {
    value = [value]
  }

  if (params[0]) {
    const elementType: string = params[0]
    return value.map((item) => this.cast(item, elementType))
  }

  return value
}

const serializeArray: CastFunction = function (
  value: any,
  params: string[] = []
) {
  if (!Array.isArray(value)) {
    return []
  }

  if (params[0]) {
    const elementType = params[0]
    return value.map((item) => this.serialize(item, elementType))
  }

  return value
}

function asDate(value: any) {
  if (isNullable(value)) {
    return null
  }
  if (value instanceof Date) return value
  return new Date(value)
}

function serializeDate(value: any) {
  if (isNullable(value)) {
    return null
  }
  if (!(value instanceof Date)) {
    value = new Date(value)
  }
  return value.toISOString().split('T')[0]
}

function asDateTime(value: any) {
  if (isNullable(value)) {
    return null
  }
  if (value instanceof Date) return value
  return new Date(value)
}

function serializeDateTime(value: any) {
  if (isNullable(value)) {
    return null
  }
  if (!(value instanceof Date)) {
    value = new Date(value)
  }
  return value.toISOString()
}

export default class CastingManager {
  private casters: Map<string, CastFunction> = new Map()
  private serializers: Map<string, SerializeFunction> = new Map()

  constructor() {
    this.register('bool', asBoolean)
    this.register('boolean', asBoolean)
    this.register('number', asNumber)
    this.register('integer', asInteger)
    this.register('decimal', asDecimal)
    this.register('string', asString)
    this.register('array', asArray, serializeArray)
    this.register('date', asDate, serializeDate)
    this.register('datetime', asDateTime, serializeDateTime)
  }

  register(
    type: string,
    castFn: CastFunction,
    serializeFn?: SerializeFunction
  ): void {
    type = type.toLowerCase()
    this.casters.set(type, castFn)

    if (serializeFn) {
      this.serializers.set(type, serializeFn)
    }
  }

  registerModel(
    type: string,
    ModelClass: typeof BaseModel,
    CollectionClass?: typeof BaseCollection
  ): this {
    let castFn = function (value: any) {
      if (value === null || value === undefined) {
        value = {}
      }

      if (value instanceof ModelClass) {
        return value
      }

      return new ModelClass(value)
    }
    this.register(type, castFn)

    if (!CollectionClass) {
      CollectionClass = BaseCollection
    }

    this.register(`${type}Collection`, function (value) {
      if (value === null || value === undefined) {
        return new CollectionClass([], castFn)
      }

      if (value instanceof CollectionClass) {
        return value
      }

      return new CollectionClass(value, castFn)
    })

    return this
  }

  cast(value: any, typeSpec: string): any {
    const [type, ...params] = typeSpec.split(':')
    const castFn = this.casters.get(type.toLowerCase())

    if (!castFn) {
      console.error(`No caster found for type: ${type}`)
      return value
    }

    try {
      // Call the cast function with this CastingManager as context
      return castFn.call(this, value, params)
    } catch (error) {
      console.error(`Error casting value to ${type}:`, error)
      return value
    }
  }

  serialize(value: any, typeSpec: string): any {
    if (
      value !== null &&
      typeof value === 'object' &&
      typeof value.toJSON === 'function' &&
      !(value instanceof Date) &&
      !(value instanceof Array)
    ) {
      return value.toJSON()
    }

    const [type, ...params] = typeSpec.split(':')
    const serializeFn = this.serializers.get(type.toLowerCase())

    if (type === 'array' && Array.isArray(value)) {
      return value.map((item: any) => this.serialize(item, params[0]))
    }

    if (!serializeFn) {
      console.info(
        `No registered serializer for ${type}. Returning value as is.`
      )
      return value
    }

    try {
      return serializeFn.call(this, value, params)
    } catch (error) {
      console.error(`Error serializing value from ${type}:`, error)
      return value
    }
  }
}
