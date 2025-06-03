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

    it('should prevent duplicate items by ID', () => {
      const collectionWithDuplicates = new TestCollection([
        { id: 1, name: 'Item A', price: 100 },
        { id: 2, name: 'Item B', price: 200 },
        { id: 1, name: 'Duplicate Item A', price: 150 }, // Should be ignored
      ])

      expect(collectionWithDuplicates.length).toBe(2)
      expect(collectionWithDuplicates[0].name).toBe('Item A')
      expect(collectionWithDuplicates[0].price).toBe(100)
    })

    it('should allow items with null ID', () => {
      const collectionWithNullIds = new TestCollection([
        { id: null, name: 'Item X', price: 100 },
        { id: null, name: 'Item Y', price: 200 },
      ])

      expect(collectionWithNullIds.length).toBe(2)
    })
  })

  describe('add method', () => {
    it('should add a new item to the collection', () => {
      const initialLength = collection.length
      collection.add({ id: 5, name: 'Item E', price: 75 })

      expect(collection.length).toBe(initialLength + 1)
      expect(collection[4].id).toBe(5)
      expect(collection[4].name).toBe('Item E')
    })

    it('should not add items with duplicate IDs', () => {
      const initialLength = collection.length
      collection.add({ id: 1, name: 'Duplicate Item A', price: 999 })

      expect(collection.length).toBe(initialLength)
      expect(collection[0].name).toBe('Item A') // Original item remains
      expect(collection[0].price).toBe(120) // Original price remains
    })

    it('should allow adding items with null IDs', () => {
      const initialLength = collection.length
      collection.add({ id: null, name: 'Null ID Item', price: 50 })

      expect(collection.length).toBe(initialLength + 1)
      expect(collection[4].id).toBeNull()
      expect(collection[4].name).toBe('Null ID Item')
    })

    it('should return the collection instance for chaining', () => {
      const result = collection.add({ id: 5, name: 'Item E', price: 75 })

      expect(result).toBe(collection)
    })
  })

  describe('remove method', () => {
    it('should remove an item by ID', () => {
      const initialLength = collection.length
      collection.remove(2) // Remove Item B

      expect(collection.length).toBe(initialLength - 1)
      expect(collection.findBy('id', 2)).toBeUndefined()
      expect(collection[1].id).toBe(3) // Item C is now at index 1
    })

    it('should remove an item by reference', () => {
      const initialLength = collection.length
      const itemToRemove = collection[2] // Item C

      collection.remove(itemToRemove)

      expect(collection.length).toBe(initialLength - 1)
      expect(collection.findBy('id', 3)).toBeUndefined()
    })

    it('should do nothing if the item does not exist', () => {
      const initialLength = collection.length
      collection.remove(999) // Non-existent ID

      expect(collection.length).toBe(initialLength)
    })

    it('should return the collection instance for chaining', () => {
      const result = collection.remove(1)

      expect(result).toBe(collection)
    })
  })

  describe('push', () => {
    it('should add and cast items to the collection', () => {
      const initialLength = collection.length
      collection.push({
        id: 5,
        name: 'Item E',
        category: 'books',
        active: true,
        price: 25,
      })

      expect(collection.length).toBe(initialLength + 1)
      expect(collection[4]).toBeInstanceOf(TestModel)
      expect(collection[4].id).toBe(5)
      expect(collection[4].name).toBe('Item E')
    })

    it('should add multiple items', () => {
      const initialLength = collection.length
      collection.push(
        { id: 5, name: 'Item E', price: 25 },
        { id: 6, name: 'Item F', price: 30 }
      )

      expect(collection.length).toBe(initialLength + 2)
      expect(collection[4].id).toBe(5)
      expect(collection[5].id).toBe(6)
    })

    it('should accept model instances', () => {
      const model = new TestModel({ id: 5, name: 'Item E', price: 25 })
      collection.push(model)

      expect(collection[4]).toBe(model) // Should be the same instance
    })

    it('should not add items with duplicate IDs', () => {
      const initialLength = collection.length
      collection.push(
        { id: 5, name: 'Item E', price: 25 },
        { id: 1, name: 'Duplicate Item A', price: 999 }, // Should be ignored
        { id: 6, name: 'Item F', price: 30 }
      )

      expect(collection.length).toBe(initialLength + 2) // Only 2 new items added
      expect(collection[4].id).toBe(5)
      expect(collection[5].id).toBe(6)
    })
  })

  describe('unshift', () => {
    it('should add items to the beginning of the collection', () => {
      const initialLength = collection.length
      collection.unshift({
        id: 5,
        name: 'Item E',
        category: 'books',
        active: true,
        price: 25,
      })

      expect(collection.length).toBe(initialLength + 1)
      expect(collection[0].id).toBe(5)
      expect(collection[1].id).toBe(1) // Original first item is now second
    })

    it('should not add items with duplicate IDs', () => {
      const initialLength = collection.length
      collection.unshift({ id: 1, name: 'Duplicate Item A', price: 999 })

      expect(collection.length).toBe(initialLength)
      expect(collection[0].name).toBe('Item A') // Original item remains
      expect(collection[0].price).toBe(120) // Original price remains
    })

    it('should add multiple items in the correct order', () => {
      const initialLength = collection.length
      collection.unshift(
        { id: 5, name: 'Item E', price: 25 },
        { id: 6, name: 'Item F', price: 30 }
      )

      expect(collection.length).toBe(initialLength + 2)
      expect(collection[0].id).toBe(5)
      expect(collection[1].id).toBe(6)
      expect(collection[2].id).toBe(1) // Original first item is now third
    })
  })

  describe('math methods', () => {
    it('should calculate sum by attribute', () => {
      const totalPrice = collection.sum('price')
      expect(totalPrice).toBe(670) // 120 + 50 + 200 + 300
    })

    it('should calculate sum using a callback function', () => {
      const totalPrice = collection.sum(
        (item) => item.price * (item.active ? 1 : 0.5)
      )
      // 120 + 50 + (200 * 0.5) + 300 = 570
      expect(totalPrice).toBe(570)
    })

    it('should calculate minimum value by attribute', () => {
      const minPrice = collection.min('price')
      expect(minPrice).toBe(50)
    })

    it('should calculate minimum value using a callback function', () => {
      const minPrice = collection.min(
        (item) => item.price / (item.category === 'electronics' ? 2 : 1)
      )
      // Min of: 120/2=60, 50, 200/2=100, 300
      expect(minPrice).toBe(50)
    })

    it('should return null for min on empty collection', () => {
      const emptyCollection = new TestCollection()
      expect(emptyCollection.min('price')).toBeNull()
    })

    it('should calculate maximum value by attribute', () => {
      const maxPrice = collection.max('price')
      expect(maxPrice).toBe(300)
    })

    it('should calculate maximum value using a callback function', () => {
      const maxPrice = collection.max(
        (item) => item.price * (item.active ? 1.1 : 1)
      )
      // Max of: 120*1.1=132, 50*1.1=55, 200, 300*1.1=330
      expect(maxPrice).toBe(330)
    })

    it('should return null for max on empty collection', () => {
      const emptyCollection = new TestCollection()
      expect(emptyCollection.max('price')).toBeNull()
    })

    it('should calculate average by attribute', () => {
      const avgPrice = collection.avg('price')
      expect(avgPrice).toBe(670 / 4) // 167.5
    })

    it('should calculate average using a callback function', () => {
      const avgPrice = collection.avg(
        (item) => item.price * (item.active ? 1 : 0.5)
      )
      // Avg of: 120, 50, 100, 300 = 570 / 4 = 142.5
      expect(avgPrice).toBe(570 / 4)
    })

    it('should return null for avg on empty collection', () => {
      const emptyCollection = new TestCollection()
      expect(emptyCollection.avg('price')).toBeNull()
    })

    it('should handle missing or non-numeric values gracefully', () => {
      const collectionWithMissing = new TestCollection([
        { id: 1, name: 'Item A', price: 100 },
        { id: 2, name: 'Item B' }, // Missing price
        { id: 3, name: 'Item C', price: 'invalid' }, // Non-numeric price
        { id: 4, name: 'Item D', price: 200 },
      ])

      expect(collectionWithMissing.sum('price')).toBe(300)
      expect(collectionWithMissing.min('price')).toBe(100)
      expect(collectionWithMissing.max('price')).toBe(200)
      expect(collectionWithMissing.avg('price')).toBe(75) // 300 / 4
    })
  })

  describe('filterBy', () => {
    it('should filter by attribute value', () => {
      const electronicsItems = collection.filterBy('category', 'electronics')

      expect(electronicsItems.length).toBe(2)
      expect(electronicsItems[0].id).toBe(1)
      expect(electronicsItems[1].id).toBe(3)
      expect(electronicsItems).not.toBe(collection) // New instance
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

    it('should filter in place when inPlace is true', () => {
      // Filter to keep only electronics items
      const result = collection.filterBy('category', 'electronics', true)

      // Should modify the original collection
      expect(collection.length).toBe(2)
      expect(collection[0].id).toBe(1)
      expect(collection[1].id).toBe(3)

      // Should return the same instance for chaining
      expect(result).toBe(collection)
    })

    it('should return a new collection instance when inPlace is false', () => {
      const filteredItems = collection.filterBy('category', 'electronics')

      expect(filteredItems).toBeInstanceOf(TestCollection)
      expect(filteredItems).not.toBe(collection)

      // Original collection should remain unchanged
      expect(collection.length).toBe(4)
    })

    it('should return empty collection when no matches', () => {
      const noMatches = collection.filterBy('category', 'non-existent')

      expect(noMatches.length).toBe(0)
      expect(noMatches).toBeInstanceOf(TestCollection)
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

      // Original collection should remain unchanged
      expect(collection[0].id).toBe(1)
    })

    it('should sort by attribute in descending order', () => {
      const sortedByPriceDesc = collection.sortBy('price', 'desc')

      expect(sortedByPriceDesc.length).toBe(4)
      expect(sortedByPriceDesc[0].price).toBe(300) // Item D
      expect(sortedByPriceDesc[1].price).toBe(200) // Item C
      expect(sortedByPriceDesc[2].price).toBe(120) // Item A
      expect(sortedByPriceDesc[3].price).toBe(50) // Item B
    })

    it('should sort in place when inPlace is true', () => {
      // Sort by price ascending in place
      const result = collection.sortBy('price', 'asc', true)

      // Should modify the original collection
      expect(collection[0].price).toBe(50) // Item B
      expect(collection[1].price).toBe(120) // Item A
      expect(collection[2].price).toBe(200) // Item C
      expect(collection[3].price).toBe(300) // Item D

      // Should return the same instance for chaining
      expect(result).toBe(collection)
    })

    it('should strings case-insensitively', () => {
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

    it('should return a new collection instance when inPlace is false', () => {
      const sortedItems = collection.sortBy('price')

      expect(sortedItems).toBeInstanceOf(TestCollection)
      expect(sortedItems).not.toBe(collection)
    })
  })

  describe('groupBy', () => {
    it('should group items by attribute', () => {
      const groupedByCategory = collection.groupBy('category')

      expect(Object.keys(groupedByCategory).length).toBe(3)
      expect(groupedByCategory['electronics'].length).toBe(2)
      expect(groupedByCategory['clothing'].length).toBe(1)
      expect(groupedByCategory['furniture'].length).toBe(1)

      expect(groupedByCategory['electronics'][0].id).toBe(1) // Item A
      expect(groupedByCategory['electronics'][1].id).toBe(3) // Item C
      expect(groupedByCategory['clothing'][0].id).toBe(2) // Item B
      expect(groupedByCategory['furniture'][0].id).toBe(4) // Item D
    })

    it('should group items using a callback function', () => {
      const groupedByPriceRange = collection.groupBy((item) => {
        if (item.price < 100) return 'budget'
        if (item.price < 200) return 'mid-range'
        return 'premium'
      })

      expect(Object.keys(groupedByPriceRange).length).toBe(3)
      expect(groupedByPriceRange['budget'].length).toBe(1) // Item B
      expect(groupedByPriceRange['mid-range'].length).toBe(1) // Item A
      expect(groupedByPriceRange['premium'].length).toBe(2) // Items C and D

      expect(groupedByPriceRange['budget'][0].id).toBe(2)
      expect(groupedByPriceRange['mid-range'][0].id).toBe(1)
      expect(groupedByPriceRange['premium'][0].id).toBe(3)
      expect(groupedByPriceRange['premium'][1].id).toBe(4)
    })

    it('should handle empty collections', () => {
      const emptyCollection = new TestCollection()
      const grouped = emptyCollection.groupBy('category')

      expect(Object.keys(grouped).length).toBe(0)
    })

    it('should handle missing attribute values', () => {
      const collectionWithMissing = new TestCollection([
        { id: 1, name: 'Item A', category: 'electronics' },
        { id: 2, name: 'Item B' }, // Missing category
        { id: 3, name: 'Item C', category: 'electronics' },
      ])

      const grouped = collectionWithMissing.groupBy('category')

      expect(Object.keys(grouped).length).toBe(2) // "electronics" and "undefined"
      expect(grouped['electronics'].length).toBe(2)
      expect(grouped['undefined'].length).toBe(1)
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

  describe('toArray', () => {
    it('should convert collection to plain array', () => {
      const array = collection.toArray()

      expect(Array.isArray(array)).toBe(true)
      expect(array).not.toBe(collection) // Should be a new instance
      expect(array.length).toBe(collection.length)

      // Array should contain the same objects
      expect(array[0]).toBe(collection[0])
      expect(array[1]).toBe(collection[1])
    })

    it('should work with empty collection', () => {
      const emptyCollection = new TestCollection()
      const array = emptyCollection.toArray()

      expect(Array.isArray(array)).toBe(true)
      expect(array.length).toBe(0)
    })
  })

  describe('head and tail', () => {
    it('should return the first item by default', () => {
      const head = collection.head()

      expect(head).toBeInstanceOf(TestCollection)
      expect(head.length).toBe(1)
      expect(head[0].id).toBe(1) // Item A
    })

    it('should return the specified number of first items', () => {
      const head = collection.head(2)

      expect(head).toBeInstanceOf(TestCollection)
      expect(head.length).toBe(2)
      expect(head[0].id).toBe(1) // Item A
      expect(head[1].id).toBe(2) // Item B
    })

    it('should return the last item by default', () => {
      const tail = collection.tail()

      expect(tail).toBeInstanceOf(TestCollection)
      expect(tail.length).toBe(1)
      expect(tail[0].id).toBe(4) // Item D
    })

    it('should return the specified number of last items', () => {
      const tail = collection.tail(2)

      expect(tail).toBeInstanceOf(TestCollection)
      expect(tail.length).toBe(2)
      expect(tail[0].id).toBe(3) // Item C
      expect(tail[1].id).toBe(4) // Item D
    })

    it('should handle requests larger than collection size', () => {
      const head = collection.head(10)
      const tail = collection.tail(10)

      expect(head.length).toBe(4) // All items
      expect(tail.length).toBe(4) // All items
    })

    it('should handle empty collections', () => {
      const emptyCollection = new TestCollection()

      expect(emptyCollection.head().length).toBe(0)
      expect(emptyCollection.tail().length).toBe(0)
    })
  })

  describe('toRows', () => {
    it('should organize items into rows', () => {
      const rows = collection.toRows(2)

      expect(rows.length).toBe(2) // 4 items ÷ 2 per row = 2 rows
      expect(rows[0].length).toBe(2)
      expect(rows[1].length).toBe(2)

      expect(rows[0][0].id).toBe(1) // Item A
      expect(rows[0][1].id).toBe(2) // Item B
      expect(rows[1][0].id).toBe(3) // Item C
      expect(rows[1][1].id).toBe(4) // Item D
    })

    it('should handle uneven divisions', () => {
      const rows = collection.toRows(3)

      expect(rows.length).toBe(2) // Ceiling of 4÷3 = 2 rows
      expect(rows[0].length).toBe(3)
      expect(rows[1].length).toBe(1)
    })

    it('should throw error for invalid items per row', () => {
      expect(() => collection.toRows(0)).toThrow()
      expect(() => collection.toRows(-1)).toThrow()
    })

    it('should handle empty collections', () => {
      const emptyCollection = new TestCollection()
      const rows = emptyCollection.toRows(2)

      expect(rows.length).toBe(0)
    })
  })

  describe('toColumns', () => {
    it('should organize items into columns', () => {
      const columns = collection.toColumns(2)

      expect(columns.length).toBe(2) // 2 columns as requested
      expect(columns[0].length).toBe(2) // Items A and C
      expect(columns[1].length).toBe(2) // Items B and D

      expect(columns[0][0].id).toBe(1) // Item A (index 0 → column 0)
      expect(columns[1][0].id).toBe(2) // Item B (index 1 → column 1)
      expect(columns[0][1].id).toBe(3) // Item C (index 2 → column 0)
      expect(columns[1][1].id).toBe(4) // Item D (index 3 → column 1)
    })

    it('should handle uneven distributions', () => {
      // Three columns for four items
      const columns = collection.toColumns(3)

      expect(columns.length).toBe(3)
      expect(columns[0].length).toBe(2) // Items A and D
      expect(columns[1].length).toBe(1) // Item B
      expect(columns[2].length).toBe(1) // Item C

      expect(columns[0][0].id).toBe(1) // Item A (index 0 → column 0)
      expect(columns[1][0].id).toBe(2) // Item B (index 1 → column 1)
      expect(columns[2][0].id).toBe(3) // Item C (index 2 → column 2)
      expect(columns[0][1].id).toBe(4) // Item D (index 3 → column 0)
    })

    it('should throw error for invalid number of columns', () => {
      expect(() => collection.toColumns(0)).toThrow()
      expect(() => collection.toColumns(-1)).toThrow()
    })

    it('should handle empty collections', () => {
      const emptyCollection = new TestCollection()
      const columns = emptyCollection.toColumns(2)

      expect(columns.length).toBe(2)
      expect(columns[0].length).toBe(0)
      expect(columns[1].length).toBe(0)
    })
  })

  describe('map', () => {
    it('should support map method', () => {
      const names = collection.map((item) => item.name)

      expect(Array.isArray(names)).toBe(true)
      expect(names).toEqual(['Item A', 'Item B', 'Item C', 'Item D'])
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
    it('should support filter method', () => {
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

    it('should support forEach method', () => {
      let count = 0
      collection.forEach(() => count++)

      expect(count).toBe(4)
    })

    it('should support slice method', () => {
      const sliced = collection.slice(1, 3)

      expect(sliced.length).toBe(2)
      expect(sliced[0].id).toBe(2) // Item B
      expect(sliced[1].id).toBe(3) // Item C
    })
  })

  describe('slice and splice methods', () => {
    it('should return a new BaseCollection instance from slice', () => {
      const sliced = collection.slice(1, 3)

      expect(sliced).toBeInstanceOf(TestCollection)
      expect(sliced).not.toBe(collection)
      expect(sliced.length).toBe(2)
      expect(sliced[0].id).toBe(2) // Item B
      expect(sliced[1].id).toBe(3) // Item C
    })

    it('should handle slice with no arguments', () => {
      const sliced = collection.slice()

      expect(sliced).toBeInstanceOf(TestCollection)
      expect(sliced.length).toBe(collection.length)
      expect(sliced).not.toBe(collection)
    })

    it('should handle slice with only start parameter', () => {
      const sliced = collection.slice(2)

      expect(sliced).toBeInstanceOf(TestCollection)
      expect(sliced.length).toBe(2)
      expect(sliced[0].id).toBe(3) // Item C
      expect(sliced[1].id).toBe(4) // Item D
    })

    it('should handle slice with negative indices', () => {
      const sliced = collection.slice(-2)

      expect(sliced).toBeInstanceOf(TestCollection)
      expect(sliced.length).toBe(2)
      expect(sliced[0].id).toBe(3) // Item C
      expect(sliced[1].id).toBe(4) // Item D
    })

    it('should cast new items in splice method', () => {
      const removedItems = collection.splice(1, 1, {
        id: 5,
        name: 'Item E',
        price: 100,
        category: 'books',
        active: true,
      })

      expect(removedItems.length).toBe(1)
      expect(removedItems[0].id).toBe(2) // Item B was removed
      expect(collection.length).toBe(4) // Still 4 items
      expect(collection[1]).toBeInstanceOf(TestModel) // New item is cast
      expect(collection[1].id).toBe(5)
      expect(collection[1].name).toBe('Item E')
    })

    it('should handle splice with multiple new items', () => {
      const removedItems = collection.splice(
        2,
        1,
        { id: 5, name: 'Item E', price: 100 },
        { id: 6, name: 'Item F', price: 150 }
      )

      expect(removedItems.length).toBe(1)
      expect(removedItems[0].id).toBe(3) // Item C was removed
      expect(collection.length).toBe(5) // 4 - 1 + 2 = 5 items
      expect(collection[2]).toBeInstanceOf(TestModel)
      expect(collection[3]).toBeInstanceOf(TestModel)
      expect(collection[2].id).toBe(5)
      expect(collection[3].id).toBe(6)
    })

    it('should handle splice with only removal', () => {
      const removedItems = collection.splice(1, 2)

      expect(removedItems.length).toBe(2)
      expect(removedItems[0].id).toBe(2) // Item B
      expect(removedItems[1].id).toBe(3) // Item C
      expect(collection.length).toBe(2) // Only 2 items left
      expect(collection[0].id).toBe(1) // Item A
      expect(collection[1].id).toBe(4) // Item D
    })

    it('should handle splice with no deleteCount', () => {
      const removedItems = collection.splice(2)

      expect(removedItems.length).toBe(2) // Items C and D removed
      expect(collection.length).toBe(2) // Only Items A and B left
      expect(collection[0].id).toBe(1)
      expect(collection[1].id).toBe(2)
    })
  })

  describe('mixed operations', () => {
    it('should support method chaining', () => {
      // Adding items, filtering, sorting, and taking the head
      const result = collection
        .add({
          id: 5,
          name: 'Item E',
          price: 75,
          category: 'electronics',
          active: true,
        })
        .add({
          id: 6,
          name: 'Item F',
          price: 25,
          category: 'books',
          active: false,
        })
        .filterBy('active', true)
        .sortBy('price', 'asc')
        .head(2)

      expect(result.length).toBe(2)
      expect(result[0].id).toBe(2) // Item B (price 50)
      expect(result[1].id).toBe(5) // Item E (price 75)
    })

    it('should combine filtering with grouping', () => {
      // Filter to active items only, then group by category
      const activeItems = collection.filterBy('active', true)
      const grouped = activeItems.groupBy('category')

      expect(Object.keys(grouped).length).toBe(3)
      expect(grouped['electronics'].length).toBe(1) // Just Item A
      expect(grouped['clothing'].length).toBe(1) // Just Item B
      expect(grouped['furniture'].length).toBe(1) // Just Item D
    })

    it('should handle advanced filtering scenarios', () => {
      // Items that are expensive and active
      const result = collection.filterBy(
        (item) => item.price > 100 && item.active
      )

      expect(result.length).toBe(2)
      expect(result[0].id).toBe(1) // Item A
      expect(result[1].id).toBe(4) // Item D
    })
  })
})
