import { describe, it, expect, vi, beforeEach } from 'vitest'
import ClassBuilder from '../src/ClassBuilder'
import CastingManager from '../src/CastingManager'
import BaseModel from '../src/BaseModel'
import BaseCollection from '../src/BaseCollection'
import { PropertySchema } from '../../temp/ClassGenerator'

describe('ClassBuilder', () => {
  let castingManager: CastingManager
  let builder: ClassBuilder

  beforeEach(() => {
    castingManager = new CastingManager()
    builder = new ClassBuilder(castingManager)
  })

  describe('withClass().add().build() fluent API', () => {
    it('enhances a class with properties', () => {
      class Person extends BaseModel {
        constructor(data: Record<string, any> = {}) {
          super(data)
        }
      }

      const EnhancedPerson = builder
        .withClass(Person)
        .add('props', {
          name: 'string',
          age: 'number',
          email: 'string',
        })
        .build()

      const person = new EnhancedPerson({
        name: 'John Doe',
        age: '42', // Should be cast to number
        email: 'john@example.com',
      })

      expect(person.name).toBe('John Doe')
      expect(person.age).toBe(42)
      expect(person.email).toBe('john@example.com')
    })

    it('adds methods to a class', () => {
      class Person extends BaseModel {
        constructor(data: Record<string, any> = {}) {
          super(data)
        }
      }

      const EnhancedPerson = builder
        .withClass(Person)
        .add('props', {
          firstName: 'string',
          lastName: 'string',
        })
        .add('methods', {
          getFullName: function (this: any) {
            return `${this.firstName} ${this.lastName}`
          },
        })
        .build()

      const person = new EnhancedPerson({
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(person.getFullName()).toBe('John Doe')
    })

    it('supports built-in timestamps mixin', () => {
      vi.useFakeTimers()
      const dateNow = new Date()
      vi.setSystemTime(dateNow)

      class Task extends BaseModel {
        constructor(data: Record<string, any> = {}) {
          super(data)
        }
      }

      const EnhancedTask = builder
        .withClass(Task)
        .add('props', {
          title: 'string',
          completed: 'boolean',
        })
        .add('timestamps')
        .build()

      const task = new EnhancedTask({
        title: 'Test task',
        completed: false,
      })

      expect(task.created_at).toEqual(dateNow)
      expect(task.updated_at).toEqual(dateNow)

      // Advance time and touch the model
      vi.advanceTimersByTime(1000)
      const newDate = new Date()

      task.touch()
      expect(task.updated_at).toEqual(newDate)

      vi.useRealTimers()
    })

    it('supports built-in softDelete mixin', () => {
      vi.useFakeTimers()
      const initialDate = new Date()
      vi.setSystemTime(initialDate)

      class Post extends BaseModel {
        constructor(data: Record<string, any> = {}) {
          super(data)
        }
      }

      const EnhancedPost = builder
        .withClass(Post)
        .add('props', {
          title: 'string',
          content: 'string',
        })
        .add('timestamps')
        .add('softDelete')
        .build()

      const post = new EnhancedPost({
        title: 'Test Post',
        content: 'This is a test',
      })

      expect(post.deleted_at).toBeUndefined()
      expect(post.isDeleted()).toBe(false)

      // Advance time and delete the post
      vi.advanceTimersByTime(1000)
      const deleteDate = new Date()

      post.delete()
      expect(post.deleted_at).toEqual(deleteDate)
      expect(post.updated_at).toEqual(deleteDate)
      expect(post.isDeleted()).toBe(true)

      // Advance time and restore the post
      vi.advanceTimersByTime(1000)
      const restoreDate = new Date()

      post.restore()
      expect(post.deleted_at).toBeNull()
      expect(post.updated_at).toEqual(restoreDate)
      expect(post.isDeleted()).toBe(false)

      vi.useRealTimers()
    })

    it('supports custom mixin registration', () => {
      // Register a custom mixin
      builder.registerMixin(
        'sluggable',
        function (Class: any, options: any = {}) {
          const sourceField = options.sourceField || 'title'
          const targetField = options.targetField || 'slug'

          const props: Record<string, string | PropertySchema> = {}
          props[targetField] = 'string'

          this.add('props', props)

          // Add generateSlug method
          this.add('methods', {
            generateSlug: function (this: any) {
              const source = this[sourceField] || ''
              this[targetField] = source
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
              return this
            },
          })

          // Hook into the fill method to generate slug on fill
          const originalFill = Class.prototype.fill
          Class.prototype.fill = function (data: any) {
            const result = originalFill.call(this, data)
            if (this[sourceField] && !data[targetField]) {
              this.generateSlug()
            }
            return result
          }
        }
      )

      class Post extends BaseModel {
        constructor(data: Record<string, any> = {}) {
          super(data)
        }
      }

      const SluggedPost = builder
        .withClass(Post)
        .add('props', {
          title: 'string',
          content: 'string',
        })
        .add('sluggable', { sourceField: 'title' })
        .build()

      const post = new SluggedPost({
        title: 'This is a Test Post!',
        content: 'Some content',
      })

      expect(post.slug).toBe('this-is-a-test-post')

      // Test manual slug generation
      post.title = 'Updated Title'
      post.generateSlug()
      expect(post.slug).toBe('updated-title')
    })

    it('supports enhancing different parent classes', () => {
      // Create a custom parent class
      class CustomBase {
        protected data: Record<string, any> = {}

        constructor(data: Record<string, any> = {}) {
          Object.assign(this.data, data)
        }

        getData() {
          return this.data
        }
      }

      const EnhancedCustomBase = builder
        .withClass(CustomBase)
        .add('props', {
          name: 'string',
          age: 'number',
        })
        .build()

      const instance = new EnhancedCustomBase()
      instance.name = 'John'
      instance.age = '30'

      expect(instance).toBeInstanceOf(CustomBase)
      expect(instance.getData).toBeDefined()
      expect(instance.name).toBe('John')
      expect(instance.age).toBe(30)
    })
  })

  describe('newModelClass', () => {
    it('creates a model class with properties', () => {
      const Person = builder.newModelClass({
        name: 'string',
        age: 'number',
        email: 'string',
      })

      const person = new Person({
        name: 'John Doe',
        age: '42', // Should be cast to number
        email: 'john@example.com',
        // @ts-ignore
      }) as Person

      expect(person).toBeInstanceOf(BaseModel)
      expect(person).toBeInstanceOf(Person)
      expect(person.name).toBe('John Doe')
      expect(person.age).toBe(42)
      expect(person.email).toBe('john@example.com')
    })

    it('creates a model class with properties, mixins, and methods', () => {
      vi.useFakeTimers()
      const initialDate = new Date()
      vi.setSystemTime(initialDate)

      const Task = builder.newModelClass(
        {
          title: 'string',
          priority: 'number',
          completed: 'boolean',
        },
        { timestamps: {}, softDelete: {} },
        {
          isPriority: function (this: any) {
            return this.priority > 5
          },
          complete: function (this: any) {
            this.completed = true
            this.touch()
            return this
          },
        }
      )

      const task = new Task({
        title: 'Important task',
        priority: 8,
        completed: false,
        // @ts-ignore
      }) as Task

      expect(task.created_at).toEqual(initialDate)
      expect(task.title).toBe('Important task')
      expect(task.isPriority()).toBe(true)

      // Advance time and complete the task
      vi.advanceTimersByTime(1000)
      const completeDate = new Date()

      task.complete()
      expect(task.completed).toBe(true)
      expect(task.updated_at).toEqual(completeDate)

      // Test soft delete functionality
      task.delete()
      expect(task.isDeleted()).toBe(true)

      vi.useRealTimers()
    })
  })

  describe('newCollectionClass', () => {
    it('creates a collection class for a model', () => {
      const Person = builder.newModelClass({
        name: 'string',
        age: 'number',
      })

      const PeopleCollection = builder.newCollectionClass(Person)

      // @ts-ignore
      const collection = new PeopleCollection(
        [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
        ],
        (data) => castingManager.cast(data, 'Person')
      )

      expect(collection).toBeInstanceOf(BaseCollection)
      expect(collection.length).toBe(2)
      expect(collection[0]).toBeInstanceOf(Person)
      expect(collection[0].name).toBe('John')
      expect(collection[1].name).toBe('Jane')
    })

    it('creates a collection class with mixins and methods', () => {
      const Product = builder.newModelClass({
        name: 'string',
        price: 'number',
        category: 'string',
      })

      const ProductCollection = builder.newCollectionClass(
        Product,
        {}, // No mixins for this example
        {
          getTotalPrice: function (this: any) {
            return this.reduce(
              (sum: number, product: any) => sum + product.price,
              0
            )
          },
          filterByCategory: function (this: any, category: string) {
            return this.filterBy('category', category)
          },
        }
      )

      const products = new ProductCollection(
        [
          { name: 'Laptop', price: 1200, category: 'electronics' },
          { name: 'Phone', price: 800, category: 'electronics' },
          { name: 'Desk', price: 350, category: 'furniture' },
        ]
        // @ts-ignore
      ) as ProductCollection

      expect(products.getTotalPrice()).toBe(2350)

      const electronicsOnly = products.filterByCategory('electronics')
      expect(electronicsOnly.length).toBe(2)
      expect(electronicsOnly.getTotalPrice()).toBe(2000)
    })
  })

  describe('serialization', () => {
    it('correctly serializes model instances to JSON', () => {
      const User = builder.newModelClass(
        {
          name: 'string',
          email: 'string',
          joined_at: 'date',
          preferences: 'array:string',
        },
        { timestamps: {} }
      )

      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        joined_at: '2023-01-15',
        preferences: ['dark-mode', 'notifications-on'],
      })

      const json = user.toJSON()

      expect(json.name).toBe('John Doe')
      expect(json.email).toBe('john@example.com')
      expect(json.joined_at).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Date serialized as YYYY-MM-DD
      expect(json.preferences).toEqual(['dark-mode', 'notifications-on'])
      expect(json.created_at).toBeDefined()
      expect(json.updated_at).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('throws error when trying to add without calling withClass first', () => {
      expect(() => {
        builder.add('props', { name: 'string' })
      }).toThrow('You must call withClass() before adding mixins')
    })

    it('throws error when trying to build without calling withClass first', () => {
      expect(() => {
        builder.build()
      }).toThrow('You must call withClass() before building')
    })

    it('throws error when mixin not found', () => {
      class TestClass extends BaseModel {}

      expect(() => {
        builder.withClass(TestClass).add('nonexistent')
      }).toThrow("Mixin 'nonexistent' not found")
    })
  })
})
