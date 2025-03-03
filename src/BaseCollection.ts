export type ItemCastingFunction<T> = (item: any) => T

export default class BaseCollection<T = any> extends Array<T> {
  protected _castingFn: ItemCastingFunction<T>

  constructor(items: any[] = [], castingFn: ItemCastingFunction<T>) {
    super()

    this._castingFn = castingFn

    // Add initial items
    if (Array.isArray(items)) {
      items.forEach((item) => this.push(this._castItem(item)))
    }
  }

  protected _castItem(item: any): T {
    return this._castingFn(item)
  }

  push(...items: any[]): number {
    // Cast each item before adding it
    const castedItems = items.map((item) => this._castItem(item))
    return super.push(...castedItems)
  }

  protected _newInstance(items: any[] = []): BaseCollection<T> {
    const Constructor = this.constructor as typeof BaseCollection
    return new Constructor(items, this._castingFn)
  }

  filterBy(
    attributeOrFunction:
      | string
      | ((item: T, index: number, array: T[]) => boolean),
    value?: any
  ): BaseCollection<T> {
    let filterFn: (item: T, index: number, array: T[]) => boolean

    if (typeof attributeOrFunction === 'string') {
      // Filter by attribute value
      filterFn = (item: T) => {
        const itemAny = item as any
        if (typeof itemAny === 'object' && itemAny !== null) {
          return itemAny[attributeOrFunction] === value
        }
        return false
      }
    } else {
      // Use provided filter function
      filterFn = attributeOrFunction
    }

    // Apply filter and return a new collection
    const filteredItems = Array.prototype.filter.call(this, filterFn)
    return this._newInstance(filteredItems)
  }

  sortBy(
    attributeOrFunction: string | ((a: T, b: T) => number),
    direction: 'asc' | 'desc' = 'asc'
  ): BaseCollection<T> {
    const items = [...this]

    let sortFn: (a: T, b: T) => number

    if (typeof attributeOrFunction === 'string') {
      // Sort by attribute value
      sortFn = (a: T, b: T) => {
        const aAny = a as any
        const bAny = b as any

        let aValue = aAny[attributeOrFunction]
        let bValue = bAny[attributeOrFunction]

        // Handle string comparison case-insensitively
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue)
        }

        // Default comparison
        if (aValue < bValue) return -1
        if (aValue > bValue) return 1
        return 0
      }
    } else {
      // Use provided sorter function
      sortFn = attributeOrFunction
    }

    // Apply sort direction
    items.sort((a, b) => {
      const result = sortFn(a, b)
      return direction === 'asc' ? result : -result
    })

    return this._newInstance(items)
  }

  findBy(
    attributeOrFunction:
      | string
      | ((item: T, index: number, array: T[]) => boolean),
    value?: any
  ): T | undefined {
    let findFn: (item: T, index: number, array: T[]) => boolean

    if (typeof attributeOrFunction === 'string') {
      // Find by attribute value
      findFn = (item: T) => {
        const itemAny = item as any
        if (typeof itemAny === 'object' && itemAny !== null) {
          return itemAny[attributeOrFunction] === value
        }
        return false
      }
    } else {
      // Use provided find function
      findFn = attributeOrFunction
    }

    return Array.prototype.find.call(this, findFn)
  }

  map<U>(callback: (item: T, index: number, array: T[]) => U): U[] {
    // @ts-ignore
    return Array.prototype.map.call([...this], callback);
  }


  toJSON(): any[] {
    return Array.prototype.map.call([...this], (item: any) => {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.toJSON === 'function'
      ) {
        return item.toJSON()
      }
      return item
    })
  }

  clone(): BaseCollection<T> {
    const clonedItems = Array.prototype.map.call([...this], (item: any) => {
      if (
        item &&
        typeof item === 'object' &&
        typeof item.clone === 'function'
      ) {
        return item.clone()
      }

      // For simple items or objects without clone method, create a copy
      if (typeof item === 'object' && item !== null) {
        return JSON.parse(JSON.stringify(item))
      }

      return item
    })

    return this._newInstance(clonedItems)
  }
}
