import { describe, it, expect, vi, beforeEach } from 'vitest'
import CastingManager from '../src/CastingManager'

describe('CastingManager', () => {
  let castingManager: CastingManager

  beforeEach(() => {
    castingManager = new CastingManager()
  })

  describe('built-in casters', () => {
    it('converts values to numbers', () => {
      expect(castingManager.cast('123', 'number')).toBe(123)
      expect(castingManager.cast('abc', 'number')).toBe(0)
      expect(castingManager.cast(456, 'number')).toBe(456)
    })

    it('returns null for falsy values', () => {
      expect(castingManager.cast(null, 'number')).toBe(null)
      expect(castingManager.cast(undefined, 'number')).toBe(null)
    })

    it('converts values to decimal numbers with precision', () => {
      expect(castingManager.cast('123.456', 'decimal')).toBe(123.46)
      expect(castingManager.cast('123.456', 'decimal:3')).toBe(123.456)
      expect(castingManager.cast('123.4567', 'decimal:2')).toBe(123.46)
      expect(castingManager.cast(123.456, 'decimal:1')).toBe(123.5)
    })

    it('converts values to strings', () => {
      expect(castingManager.cast(123, 'string')).toBe('123')
      expect(castingManager.cast(null, 'string')).toBe(null)
      expect(castingManager.cast(undefined, 'string')).toBe(null)
      expect(castingManager.cast(true, 'string')).toBe('true')
      expect(castingManager.cast([1, 2, 3], 'string')).toBe('1,2,3')
    })

    it('converts values to Date objects', () => {
      const date = castingManager.cast('2023-01-15', 'date')
      expect(date instanceof Date).toBe(true)
      expect(date.getFullYear()).toBe(2023)
      expect(date.getMonth()).toBe(0) // January is 0
      expect(date.getDate()).toBe(15)

      const existingDate = new Date()
      expect(castingManager.cast(existingDate, 'date')).toBe(existingDate)
    })

    it('converts values to Date objects with time', () => {
      const datetime = castingManager.cast(
        '2023-01-15T14:30:45.000Z',
        'datetime'
      )
      expect(datetime instanceof Date).toBe(true)
      expect(datetime.getUTCFullYear()).toBe(2023)
      expect(datetime.getUTCMonth()).toBe(0)
      expect(datetime.getUTCDate()).toBe(15)
      expect(datetime.getUTCHours()).toBe(14)
      expect(datetime.getUTCMinutes()).toBe(30)
      expect(datetime.getUTCSeconds()).toBe(45)
    })

    it('converts values to arrays', () => {
      expect(castingManager.cast('test', 'array')).toEqual(['test'])
      expect(castingManager.cast([1, 2, 3], 'array')).toEqual([1, 2, 3])

      // Test with element type
      const result = castingManager.cast(['123', '456'], 'array:number')
      expect(result).toEqual([123, 456])
    })
  })

  describe('serialize', () => {
    it('formats dates as YYYY-MM-DD', () => {
      const date = new Date('2023-05-15T12:00:00Z')
      expect(castingManager.serialize(date, 'date')).toBe('2023-05-15')
    })

    it('formats dates as ISO strings', () => {
      const date = new Date('2023-05-15T12:00:00Z')
      const serialized = castingManager.serialize(date, 'datetime')
      expect(serialized).toBe(date.toISOString())
    })

    it('serializes array elements', () => {
      const dates = [new Date('2023-01-15'), new Date('2023-02-20')]

      const serialized = castingManager.serialize(dates, 'array:date')
      expect(serialized).toEqual(['2023-01-15', '2023-02-20'])
    })

    it('uses toJSON method of custom objects when available', () => {
      const customObj = {
        name: 'Test',
        toJSON: () => ({ serialized: true, name: 'Test' }),
      }

      expect(castingManager.serialize(customObj, 'any')).toEqual({
        serialized: true,
        name: 'Test',
      })
    })
  })

  describe('custom types', () => {
    it('allows registering and using custom types', () => {
      // Register a boolean type
      castingManager.register(
        'boolean',
        function (value) {
          if (typeof value === 'boolean') return value
          if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1'
          }
          return Boolean(value)
        },
        function (value) {
          return value ? true : false
        }
      )

      expect(castingManager.cast('true', 'boolean')).toBe(true)
      expect(castingManager.cast('false', 'boolean')).toBe(false)
      expect(castingManager.cast('1', 'boolean')).toBe(true)
      expect(castingManager.cast('0', 'boolean')).toBe(false)
      expect(castingManager.cast(1, 'boolean')).toBe(true)
      expect(castingManager.cast(0, 'boolean')).toBe(false)
    })

    it('handles custom types that reference other types', () => {
      // Register a Person type
      castingManager.register(
        'person',
        function (value) {
          return {
            name: this.cast(value.name || '', 'string'),
            age: this.cast(value.age || 0, 'number'),
            birthdate: value.birthdate
              ? this.cast(value.birthdate, 'date')
              : null,
          }
        },
        function (value) {
          return {
            name: value.name,
            age: value.age,
            birthdate: value.birthdate
              ? this.serialize(value.birthdate, 'date')
              : null,
          }
        }
      )

      const personData = {
        name: 123, // should be cast to string
        age: '30', // should be cast to number
        birthdate: '1993-05-15',
      }

      const person = castingManager.cast(personData, 'person')
      expect(person.name).toBe('123')
      expect(person.age).toBe(30)
      expect(person.birthdate instanceof Date).toBe(true)

      const serialized = castingManager.serialize(person, 'person')
      expect(serialized.name).toBe('123')
      expect(serialized.age).toBe(30)
      expect(serialized.birthdate).toBe('1993-05-15')
    })
  })

  describe('error handling', () => {
    it('handles non-existent types gracefully', () => {
      console.error = vi.fn()

      const value = { test: true }
      const result = castingManager.cast(value, 'nonexistent')

      expect(result).toBe(value) // Should return original value
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('No caster found for type: nonexistent')
      )
    })

    it('handles casting errors gracefully', () => {
      console.error = vi.fn()

      // Register a type that throws an error
      castingManager.register('problematic', function () {
        throw new Error('Test error')
      })

      const value = { test: true }
      const result = castingManager.cast(value, 'problematic')

      expect(result).toBe(value) // Should return original value
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error casting value to problematic'),
        expect.any(Error)
      )
    })
  })
})
