import { describe, it, expect, beforeEach } from 'vitest'
import BaseModel from '../src/BaseModel'

// Create a test model class that extends BaseModel
class TestModel extends BaseModel {
  get name() {
    return this._data.name
  }

  set name(value: string) {
    this._data.name = value
  }

  get email() {
    return this._data.email
  }

  set email(value: string) {
    this._data.email = value
  }

  get age() {
    return this._data.age
  }

  set age(value: number) {
    this._data.age = value
  }

  get active() {
    return this._data.active
  }

  set active(value: boolean) {
    this._data.active = !!value
  }

  // Add a test method
  getFullName() {
    return `${this.name}`
  }
}

describe('BaseModel', () => {
  let model: TestModel

  beforeEach(() => {
    // Create a fresh model instance before each test
    model = new TestModel({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      active: true,
    })
  })

  describe('constructor', () => {
    it('should initialize with provided data', () => {
      expect(model.name).toBe('John Doe')
      expect(model.email).toBe('john@example.com')
      expect(model.age).toBe(30)
      expect(model.active).toBe(true)
    })

    it('should handle empty constructor', () => {
      const emptyModel = new TestModel()
      expect(emptyModel.name).toBeUndefined()
      expect(emptyModel.email).toBeUndefined()
      expect(emptyModel.age).toBeUndefined()
      expect(emptyModel.active).toBeUndefined()
    })

    it('should handle null or undefined data', () => {
      const nullModel = new TestModel(null)
      const undefinedModel = new TestModel(undefined)

      expect(nullModel.name).toBeUndefined()
      expect(undefinedModel.name).toBeUndefined()
    })
  })

  describe('setAttributes()', () => {
    it('should set properties using setters when available', () => {
      const testModel = new TestModel()

      // Use private method to initialize data
      ;(testModel as any).setAttributes({
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        active: false,
      })

      expect(testModel.name).toBe('Jane Smith')
      expect(testModel.email).toBe('jane@example.com')
      expect(testModel.age).toBe(25)
      expect(testModel.active).toBe(false)
    })

    it('should store properties without setters in _data', () => {
      const testModel = new TestModel()

      // Use private method to initialize data with properties that don't have setters
      ;(testModel as any).setAttributes({
        name: 'Bob',
        customField: 'custom value',
      })

      expect(testModel.name).toBe('Bob')
      expect((testModel as any)._data.customField).toBe('custom value')
    })

    it('should update model with new data', () => {
      model.setAttributes({
        name: 'Jane Smith',
        email: 'jane@example.com',
      })

      expect(model.name).toBe('Jane Smith')
      expect(model.email).toBe('jane@example.com')
      expect(model.age).toBe(30) // Unchanged
      expect(model.active).toBe(true) // Unchanged
    })

    it('should return this for chaining', () => {
      const result = model.setAttributes({ name: 'New Name' })

      expect(result).toBe(model)
    })

    it('should handle null or undefined data', () => {
      const originalName = model.name

      model.setAttributes(null)
      expect(model.name).toBe(originalName)

      model.setAttributes(undefined)
      expect(model.name).toBe(originalName)
    })
  })

  describe('toJSON', () => {
    it('should convert model to plain object', () => {
      const json = model.toJSON()

      expect(json).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        active: true,
      })
    })

    it('should exclude methods and private properties', () => {
      const json = model.toJSON()

      expect(json.getFullName).toBeUndefined()
      expect(json._data).toBeUndefined()
    })

    it('should ignore custom properties from models', () => {
      // Add a non-getter property directly to _data
      ;(model as any).customField = 'custom value'

      const json = model.toJSON()

      expect(json.customField).toBe(undefined)
    })
  })

  describe('clone', () => {
    it('should create a deep copy of the model', () => {
      const clone = model.clone() as TestModel
      console.log(clone, model)
      // Check that it's a new instance with the same data
      expect(clone).toBeInstanceOf(TestModel)
      expect(clone).not.toBe(model)
      expect(clone.name).toBe(model.name)
      expect(clone.email).toBe(model.email)
      expect(clone.age).toBe(model.age)
      expect(clone.active).toBe(model.active)
    })

    it('should create a clone with independent data', () => {
      const clone = model.clone() as TestModel

      // Modify the clone and check that original is unchanged
      clone.name = 'Jane Doe'
      clone.age = 25

      expect(model.name).toBe('John Doe')
      expect(model.age).toBe(30)
      expect(clone.name).toBe('Jane Doe')
      expect(clone.age).toBe(25)
    })

    it('should preserve methods on cloned instance', () => {
      const clone = model.clone() as TestModel

      expect(typeof clone.getFullName).toBe('function')
      clone.name = 'Jane Doe'
      expect(clone.getFullName()).toBe('Jane Doe')
    })
  })
})
