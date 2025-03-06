export type ItemCastingFunction<T> = (item: any) => T

export default class BaseCollection<T = any> extends Array<T> {
  protected _castingFn: ItemCastingFunction<T> | undefined
  protected _idAttribute: string = 'id'

  constructor(items: any[] = [], castingFn?: ItemCastingFunction<T>) {
    super()

    this._castingFn = castingFn

    // Add initial items
    if (Array.isArray(items)) {
      items.forEach((item) => this.push(this._castItem(item)))
    }
  }

  protected _castItem(item: any): T {
    return this._castingFn ? this._castingFn(item) : item
  }

  protected _getId(item: any): any {
    if (typeof item === 'object') {
      return item[this._idAttribute] !== undefined ? item[this._idAttribute] : null
    }

    return null
  }

  protected _itemExists(item: any): boolean {
    const itemId = this._getId(item)

    if (itemId === null) {
      return false
    }

    return this.some((existingItem) => this._getId(existingItem) === itemId)
  }

  add(item: any): this {
    const castedItem = this._castItem(item)

    // Only add if the item doesn't already exist
    if (!this._itemExists(castedItem)) {
      super.push(castedItem)
    }

    return this
  }

  remove(itemOrId: any): this {
    let idToRemove: any

    if (typeof itemOrId === 'object' && itemOrId !== null) {
      // If we got an object, extract its ID
      idToRemove = this._getId(itemOrId)
    } else {
      // Otherwise use the value directly as ID
      idToRemove = itemOrId
    }

    // Find the index of the item to remove
    const indexToRemove = this.findIndex(
      (item) => this._getId(item) === idToRemove
    )

    // Remove the item if found
    if (indexToRemove !== -1) {
      super.splice(indexToRemove, 1)
    }

    return this
  }

  push(...items: any[]): number {
    items.forEach((item) => this.add(item))

    return this.length
  }

  unshift(...items: any[]): number {
    const castedItems = items.map((item) => this._castItem(item))

    // Filter out items that already exist
    const newItems = castedItems.filter((item) => !this._itemExists(item))

    // If we have new items, add them at the beginning
    if (newItems.length > 0) {
      super.unshift(...newItems)
    }

    return this.length
  }

  protected _newInstance(items: any[] = []): BaseCollection<T> {
    const Constructor = this.constructor as typeof BaseCollection
    return new Constructor(items, this._castingFn)
  }

  sum(attributeOrGetter: string | ((item: T) => number)): number {
    return this.reduce((total, item) => {
      let value: number

      if (typeof attributeOrGetter === 'string') {
        const itemAny = item as any
        value =
          typeof itemAny[attributeOrGetter] === 'number'
            ? itemAny[attributeOrGetter]
            : 0
      } else {
        value = attributeOrGetter(item)
      }

      return total + (isNaN(value) ? 0 : value)
    }, 0)
  }

  min(attributeOrGetter: string | ((item: T) => number)): number | null {
    if (this.length === 0) return null

    return this.reduce((min, item) => {
      let value: number

      if (typeof attributeOrGetter === 'string') {
        const itemAny = item as any
        value =
          typeof itemAny[attributeOrGetter] === 'number'
            ? itemAny[attributeOrGetter]
            : Number.POSITIVE_INFINITY
      } else {
        value = attributeOrGetter(item)
      }

      return isNaN(value) ? min : Math.min(min, value)
    }, Number.POSITIVE_INFINITY)
  }

  max(attributeOrGetter: string | ((item: T) => number)): number | null {
    if (this.length === 0) return null

    return this.reduce((max, item) => {
      let value: number

      if (typeof attributeOrGetter === 'string') {
        const itemAny = item as any
        value =
          typeof itemAny[attributeOrGetter] === 'number'
            ? itemAny[attributeOrGetter]
            : Number.NEGATIVE_INFINITY
      } else {
        value = attributeOrGetter(item)
      }

      return isNaN(value) ? max : Math.max(max, value)
    }, Number.NEGATIVE_INFINITY)
  }

  avg(attributeOrGetter: string | ((item: T) => number)): number | null {
    if (this.length === 0) return null

    const sum = this.sum(attributeOrGetter)
    return sum / this.length
  }

  filterBy(
    attributeOrFunction:
      | string
      | ((item: T, index: number, array: T[]) => boolean),
    value?: any,
    inPlace: boolean = false
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

    if (inPlace) {
      // Filter in place by removing items that don't match
      for (let i = this.length - 1; i >= 0; i--) {
        if (!filterFn(this[i], i, this)) {
          this.splice(i, 1)
        }
      }
      return this
    } else {
      // Apply filter and return a new collection
      const filteredItems = Array.prototype.filter.call(this, filterFn)
      return this._newInstance(filteredItems)
    }
  }

  sortBy(
    attributeOrFunction: string | ((a: T, b: T) => number),
    direction: 'asc' | 'desc' = 'asc',
    inPlace: boolean = false
  ): BaseCollection<T> {
    let sortFn: (a: T, b: T) => number

    if (typeof attributeOrFunction === 'string') {
      // Sort by attribute value
      sortFn = (a: T, b: T) => {
        const aAny = a as any
        const bAny = b as any

        let aValue = aAny[attributeOrFunction]
        let bValue = bAny[attributeOrFunction]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue)
        }

        if (aValue < bValue) return -1
        if (aValue > bValue) return 1
        return 0
      }
    } else {
      // Use provided sorter function
      sortFn = attributeOrFunction
    }

    // Apply sort direction
    const directedSortFn = (a: T, b: T) => {
      const result = sortFn(a, b)
      return direction === 'asc' ? result : -result
    }

    if (inPlace) {
      // Sort the array in place
      super.sort(directedSortFn)
      return this
    } else {
      // Create a copy, sort it, and return a new collection
      const items = [...this]
      items.sort(directedSortFn)
      return this._newInstance(items)
    }
  }

  groupBy(
    attributeOrGetter: string | ((item: T) => string | number)
  ): Record<string, T[]> {
    return this.reduce((groups, item) => {
      let key: string | number

      if (typeof attributeOrGetter === 'string') {
        key = (item as any)[attributeOrGetter]
      } else {
        key = attributeOrGetter(item)
      }

      // Convert key to string to use as object property
      const keyStr = String(key)

      // Initialize the group if it doesn't exist
      if (!groups[keyStr]) {
        groups[keyStr] = []
      }

      // Add the item to its group
      groups[keyStr].push(item)

      return groups
    }, {} as Record<string, T[]>)
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
        return typeof itemAny === 'object' && itemAny[attributeOrFunction] === value
      }
    } else {
      // Use provided find function
      findFn = attributeOrFunction
    }

    return Array.prototype.find.call(this, findFn)
  }

  map<U>(callback: (item: T, index: number, array: T[]) => U): U[] {
    // @ts-ignore
    return Array.prototype.map.call([...this], callback)
  }

  head(n: number = 1): BaseCollection<T> {
    return this._newInstance(this.slice(0, n))
  }

  tail(n: number = 1): BaseCollection<T> {
    return this._newInstance(this.slice(Math.max(0, this.length - n)))
  }

  toArray(): T[] {
    return [...this]
  }

  toRows(itemsPerRow: number): T[][] {
    if (itemsPerRow <= 0) {
      throw new Error('Items per row must be greater than zero')
    }

    if (itemsPerRow === 1) {
      return [this.toArray()]
    }

    const rows: T[][] = []
    const totalRows = Math.ceil(this.length / itemsPerRow)

    for (let i = 0; i < totalRows; i++) {
      rows.push(this.slice(i * itemsPerRow, (i + 1) * itemsPerRow))
    }

    return rows
  }

  toColumns(numColumns: number): T[][] {
    if (numColumns <= 0) {
      throw new Error('Number of columns must be greater than zero')
    }

    if (numColumns === 1) {
      return [this.toArray()]
    }

    const columns: T[][] = Array.from({ length: numColumns }, () => [])

    this.forEach((item, index) => {
      const columnIndex = index % numColumns
      columns[columnIndex].push(item)
    })

    return columns
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
