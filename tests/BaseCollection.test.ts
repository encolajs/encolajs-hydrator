import { describe, it, expect, beforeEach } from 'vitest'
import BaseCollection from '../src/BaseCollection'
import BaseModel from '../src/BaseModel'

// Create a test model class
class TestModel extends BaseModel {
  get id() {
    return this._data.id
  }

  set id(value: number) {
    this._data.id = value
  }

  get name() {
    return this._data.name
  }

  set name(value: string) {
    this._data.name = value
  }

  get category() {
    return this._data.category
  }

  set category(value: string) {
    this._data.category = value
  }

  get active() {
    return this._data.active
  }

  set active(value: boolean) {
    this._data.active = !!value
  }

  get price() {
    return this._data.price
  }

  set price(value: number) {
    this._data.price = value
  }

  // Test method
  isExpensive() {
    return this.price > 100
  }
}

// Create a test collection class
class TestCollection extends BaseCollection<TestModel> {
  constructor(items: any[] = []) {
    super(items, (item) => {
      if (item instanceof TestModel) {
        return item
      }
      return new TestModel(item)
    })
  }
}

describe('BaseCollection', () => {
  let collection: TestCollection
  let models: TestModel[]

  beforeEach(() => {
    // Create sample models
    models = [
      new TestModel({
        id: 1,
        name: 'Item A',
        category: 'electronics',
        active: true,
        price: 120,
      }),
      new TestModel({
        id: 2,
        name: 'Item B',
        category: 'clothing',
        active: true,
        price: 50,
      }),
      new TestModel({
        id: 3,
        name: 'Item C',
        category: 'electronics',
        active: false,
        price: 200,
      }),
      new TestModel({
        id: 4,
        name: 'Item D',
        category: 'furniture',
        active: true,
        price: 300,
      }),
    ]

    // Create a fresh collection before each test
    collection = new TestCollection(models)
  })

  describe('constructor', () => {
    it('should initialize with provided items', () => {
      expect(collection.length).toBe(4)

      // Check that items are properly cast to TestModel
      expect(collection[0]).toBeInstanceOf(TestModel)
      expect(collection[0].name).toBe('Item A')
    })

    it('should handle empty constructor', () => {
      const emptyCollection = new TestCollection()
      expect(emptyCollection.length).toBe(0)
    })

    it('should cast plain objects to models', () => {
      const plainObjectCollection = new TestCollection([
        { id: 5, name: 'Item E', category: 'books', active: true, price: 15 },
      ])

      expect(plainObjectCollection[0]).toBeInstanceOf(TestModel)
      expect(plainObjectCollection[0].id).toBe(5)
      expect(plainObjectCollection[0].name).toBe('Item E')
    })
  })

  describe('push', () => {
    it('should add and cast items to the collection', () => {
      const newLength = collection.push({
        id: 5,
        name: 'Item E',
        category: 'books',
        active: true,
        price: 25,
      })

      expect(newLength).toBe(5)
      expect(collection[4]).toBeInstanceOf(TestModel)
      expect(collection[4].id).toBe(5)
      expect(collection[4].name).toBe('Item E')
    })

    it('should add multiple items', () => {
      const newLength = collection.push(
        { id: 5, name: 'Item E', price: 25 },
        { id: 6, name: 'Item F', price: 30 }
      )

      expect(newLength).toBe(6)
      expect(collection[4].id).toBe(5)
      expect(collection[5].id).toBe(6)
    })

    it('should accept model instances', () => {
      const model = new TestModel({ id: 5, name: 'Item E', price: 25 })
      collection.push(model)

      expect(collection[4]).toBe(model) // Should be the same instance
    })
  })

  describe('filterBy', () => {
    it('should filter by attribute value', () => {
      const electronicsItems = collection.filterBy('category', 'electronics')

      expect(electronicsItems.length).toBe(2)
      expect(electronicsItems[0].id).toBe(1)
      expect(electronicsItems[1].id).toBe(3)
    })

    it('should filter by boolean attribute', () => {
      const activeItems = collection.filterBy('active', true)

      expect(activeItems.length).toBe(3)
      expect(activeItems[0].id).toBe(1)
      expect(activeItems[1].id).toBe(2)
      expect(activeItems[2].id).toBe(4)
    })

    it('should filter using callback function', () => {
      const expensiveItems = collection.filterBy((item) => item.price > 100)

      expect(expensiveItems.length).toBe(3)
      expect(expensiveItems[0].id).toBe(1)
      expect(expensiveItems[1].id).toBe(3)
      expect(expensiveItems[2].id).toBe(4)
    })

    it('should return a new collection instance', () => {
      const filteredItems = collection.filterBy('category', 'electronics')

      expect(filteredItems).toBeInstanceOf(TestCollection)
      expect(filteredItems).not.toBe(collection)
    })

    it('should return empty collection when no matches', () => {
      const noMatches = collection.filterBy('category', 'non-existent')

      expect(noMatches.length).toBe(0)
      expect(noMatches).toBeInstanceOf(TestCollection)
    })
  })

  describe('findBy', () => {
    it('should find first item by attribute value', () => {
      const electronicsItem = collection.findBy('category', 'electronics')

      expect(electronicsItem).toBeDefined()
      expect(electronicsItem?.id).toBe(1)
      expect(electronicsItem?.name).toBe('Item A')
    })

    it('should find using callback function', () => {
      const expensiveItem = collection.findBy((item) => item.price > 150)

      expect(expensiveItem).toBeDefined()
      expect(expensiveItem?.id).toBe(3) // Item C with price 200
    })

    it('should return undefined when no matches', () => {
      const noMatch = collection.findBy('category', 'non-existent')

      expect(noMatch).toBeUndefined()
    })
  })

  describe('sortBy', () => {
    it('should sort by attribute in ascending order', () => {
      const sortedByPrice = collection.sortBy('price')

      expect(sortedByPrice.length).toBe(4)
      expect(sortedByPrice[0].price).toBe(50) // Item B
      expect(sortedByPrice[1].price).toBe(120) // Item A
      expect(sortedByPrice[2].price).toBe(200) // Item C
      expect(sortedByPrice[3].price).toBe(300) // Item D
    })

    it('should sort by attribute in descending order', () => {
      const sortedByPriceDesc = collection.sortBy('price', 'desc')

      expect(sortedByPriceDesc.length).toBe(4)
      expect(sortedByPriceDesc[0].price).toBe(300) // Item D
      expect(sortedByPriceDesc[1].price).toBe(200) // Item C
      expect(sortedByPriceDesc[2].price).toBe(120) // Item A
      expect(sortedByPriceDesc[3].price).toBe(50) // Item B
    })

    it('should sort strings case-insensitively', () => {
      // Add items with mixed case names
      collection.push(
        { id: 5, name: 'item z', price: 10 },
        { id: 6, name: 'Item b', price: 20 }
      )

      const sortedByName = collection.sortBy('name')

      expect(sortedByName[0].name).toBe('Item A')
      expect(sortedByName[1].name).toBe('Item b')
      expect(sortedByName[2].name).toBe('Item B')
      expect(sortedByName[3].name).toBe('Item C')
      expect(sortedByName[4].name).toBe('Item D')
      expect(sortedByName[5].name).toBe('item z')
    })

    it('should sort using custom compare function', () => {
      const sortedCustom = collection.sortBy((a, b) => {
        // Sort by name length, then alphabetically
        if (a.name.length !== b.name.length) {
          return a.name.length - b.name.length
        }
        return a.name.localeCompare(b.name)
      })

      expect(sortedCustom[0].name).toBe('Item A')
      expect(sortedCustom[1].name).toBe('Item B')
      expect(sortedCustom[2].name).toBe('Item C')
      expect(sortedCustom[3].name).toBe('Item D')
    })

    it('should return a new collection instance', () => {
      const sortedItems = collection.sortBy('price')

      expect(sortedItems).toBeInstanceOf(TestCollection)
      expect(sortedItems).not.toBe(collection)
    })
  })

  describe('toJSON', () => {
    it('should convert all items to plain objects', () => {
      const json = collection.toJSON()

      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBe(4)

      // Check that each item is a plain object with expected properties
      expect(json[0]).toEqual({
        id: 1,
        name: 'Item A',
        category: 'electronics',
        active: true,
        price: 120,
      })

      // Check that methods are not included
      expect(json[0].isExpensive).toBeUndefined()
    })

    it('should handle empty collection', () => {
      const emptyCollection = new TestCollection()
      const json = emptyCollection.toJSON()

      expect(Array.isArray(json)).toBe(true)
      expect(json.length).toBe(0)
    })
  })

  describe('clone', () => {
    it('should create a deep copy of the collection', () => {
      const clone = collection.clone()

      // Check that it's a new instance with the same data
      expect(clone).toBeInstanceOf(TestCollection)
      expect(clone).not.toBe(collection)
      expect(clone.length).toBe(collection.length)

      // Check that items are cloned too
      expect(clone[0]).not.toBe(collection[0])
      expect(clone[0].id).toBe(collection[0].id)
      expect(clone[0].name).toBe(collection[0].name)
    })

    it('should create a clone with independent items', () => {
      const clone = collection.clone()

      // Modify the clone and check that original is unchanged
      clone[0].name = 'Modified Item'
      clone[1].price = 999

      expect(collection[0].name).toBe('Item A')
      expect(collection[1].price).toBe(50)
      expect(clone[0].name).toBe('Modified Item')
      expect(clone[1].price).toBe(999)
    })
  })

  describe('native Array methods', () => {
    it('should support map method', () => {
      const names = collection.map((item) => item.name)

      expect(Array.isArray(names)).toBe(true)
      expect(names).toEqual(['Item A', 'Item B', 'Item C', 'Item D'])
    })

    it('should support native filter method', () => {
      const filtered = collection.filter((item) => item.price > 100)

      expect(Array.isArray(filtered)).toBe(true)
      expect(filtered.length).toBe(3)
      expect(filtered[0].id).toBe(1)
      expect(filtered[1].id).toBe(3)
      expect(filtered[2].id).toBe(4)
    })

    it('should support other array methods like reduce', () => {
      const totalPrice = collection.reduce((sum, item) => sum + item.price, 0)

      expect(totalPrice).toBe(670) // 120 + 50 + 200 + 300
    })
  })
})
