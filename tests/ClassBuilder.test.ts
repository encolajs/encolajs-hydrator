import ClassBuilder from '../src/ClassBuilder'
import CastingManager from '../src/CastingManager'

describe('ClassBuilder', () => {
  let castingManager: CastingManager
  let builder: ClassBuilder

  beforeEach(() => {
    castingManager = new CastingManager()
    builder = new ClassBuilder(castingManager)
  })

  describe('addProps', () => {
    test('should add properties to a class', () => {
      // Define a basic constructor
      function Person(this: any, data: any = {}) {
        Object.entries(data).forEach(([key, value]) => {
          if (key in this) {
            this[key] = value
          }
        })
      }

      // Add properties to Person
      builder.addProps(Person, {
        name: 'string',
        age: 'number',
        birthdate: 'date',
      })

      // Create instance with properties
      const PersonConstructor = Person as unknown as new (data?: any) => any
      const person = new PersonConstructor({
        name: 123, // Should be cast to string
        age: '30', // Should be cast to number
        birthdate: '1990-01-01', // Should be cast to date
      })

      // Test property types
      expect(person.name).toBe('123')
      expect(person.age).toBe(30)
      expect(person.birthdate instanceof Date).toBe(true)
      expect(person.birthdate.getFullYear()).toBe(1990)

      // Test setting properties after construction
      person.name = 'Jane Doe'
      person.age = '45'

      expect(person.name).toBe('Jane Doe')
      expect(person.age).toBe(45)
    })

    test('should add computed properties', () => {
      function Person(this: any, data: any = {}) {
        Object.entries(data).forEach(([key, value]) => {
          if (key in this) {
            this[key] = value
          }
        })
      }

      builder.addProps(Person, {
        firstName: 'string',
        lastName: 'string',
        fullName: {
          type: 'string',
          get: function (this: any) {
            return `${this.firstName} ${this.lastName}`
          },
          set: function (this: any, value: string) {
            const parts = value.split(' ')
            this.firstName = parts[0] || ''
            this.lastName = parts.slice(1).join(' ') || ''
          },
        },
      })

      const PersonConstructor = Person as unknown as new (data?: any) => any
      const person = new PersonConstructor({
        firstName: 'John',
        lastName: 'Doe',
      })

      // Test computed getter
      expect(person.fullName).toBe('John Doe')

      // Test computed setter
      person.fullName = 'Jane Smith'
      expect(person.firstName).toBe('Jane')
      expect(person.lastName).toBe('Smith')
    })

    test('should add property options (enumerable/configurable)', () => {
      function TestClass(this: any) {}

      builder.addProps(TestClass, {
        visible: {
          type: 'string',
          enumerable: true,
          configurable: true,
        },
        hidden: {
          type: 'string',
          enumerable: false,
          configurable: false,
        },
      })

      const TestClassConstructor = TestClass as unknown as new (
        data?: any
      ) => any
      const instance = new TestClassConstructor()
      instance.visible = 'I am visible'
      instance.hidden = 'I am hidden'

      // Check property descriptors
      const visibleDescriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'visible'
      )
      const hiddenDescriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'hidden'
      )

      expect(visibleDescriptor?.enumerable).toBe(true)
      expect(visibleDescriptor?.configurable).toBe(true)
      expect(hiddenDescriptor?.enumerable).toBe(false)
      expect(hiddenDescriptor?.configurable).toBe(false)
    })

    test('should add toJSON method for serialization', () => {
      function Event(this: any, data: any = {}) {
        Object.entries(data).forEach(([key, value]) => {
          if (key in this) {
            this[key] = value
          }
        })
      }

      builder.addProps(Event, {
        title: 'string',
        date: 'date',
        attendees: 'array:string',
      })

      const EventConstructor = Event as unknown as new (data?: any) => any
      const event = new EventConstructor({
        title: 'Conference',
        date: '2023-05-15',
        attendees: ['John', 'Jane', 'Bob'],
      })

      // Test serialization
      const serialized = JSON.parse(JSON.stringify(event))

      expect(serialized.title).toBe('Conference')
      expect(serialized.date).toBe('2023-05-15') // Should be serialized as YYYY-MM-DD
      expect(serialized.attendees).toEqual(['John', 'Jane', 'Bob'])
    })
  })

  describe('mixins', () => {
    test('should define and apply mixins', () => {
      // Define a class
      function Task(this: any, data: any = {}) {
        Object.entries(data).forEach(([key, value]) => {
          if (key in this) {
            this[key] = value
          }
        })
      }

      // Add base properties
      builder.addProps(Task, {
        title: 'string',
        completed: 'boolean',
      })

      // Define a timestamps mixin
      builder.mixin('timestamps', function (this: ClassBuilder, Class: any) {
        this.addProps(Class, {
          created_at: 'date',
          updated_at: 'date',
        })

        Class.prototype.touch = function () {
          this.updated_at = new Date()
          return this
        }
      })

      // Apply the mixin
      builder.apply(Task, 'timestamps')

      const TaskConstructor = Task as unknown as new (data?: any) => any
      const task = new TaskConstructor({
        title: 'Test task',
        completed: false,
        created_at: '2023-01-01',
      })

      // Test original properties
      expect(task.title).toBe('Test task')
      expect(task.completed).toBe(false)

      // Test mixin properties
      expect(task.created_at instanceof Date).toBe(true)

      // Test mixin methods
      expect(typeof task.touch).toBe('function')
      task.touch()
      expect(task.updated_at instanceof Date).toBe(true)
    })

    test('should throw error if mixin not found', () => {
      function TestClass(this: any) {}

      expect(() => {
        builder.apply(TestClass, 'nonexistent')
      }).toThrow("Mixin 'nonexistent' not found")
    })

    test('should pass additional arguments to mixin', () => {
      function TestClass(this: any) {}

      // Define mixin that takes arguments
      builder.mixin(
        'configurable',
        function (this: ClassBuilder, Class: any, options: any) {
          Class.prototype.getConfig = function () {
            return options
          }
        }
      )

      // Apply mixin with arguments
      builder.apply(TestClass, 'configurable', { debug: true, mode: 'test' })

      const TestClassConstructor = TestClass as unknown as new (
        data?: any
      ) => any
      const instance = new TestClassConstructor()
      expect(instance.getConfig()).toEqual({ debug: true, mode: 'test' })
    })
  })

  describe('complex scenarios', () => {
    test('should handle nested objects and type casting', () => {
      // Define Address class
      function Address(this: any, data: any = {}) {
        Object.entries(data).forEach(([key, value]) => {
          if (key in this) {
            this[key] = value
          }
        })
      }

      builder.addProps(Address, {
        street: 'string',
        city: 'string',
        zipCode: 'string',
      })

      // Define Person class that uses Address
      function Person(this: any, data: any = {}) {
        Object.entries(data).forEach(([key, value]) => {
          if (key in this) {
            this[key] = value
          }
        })
      }

      // Register Address with casting manager manually for testing
      castingManager.register(
        'Address',
        function (value) {
          if (value instanceof Address) return value
          const AddressConstructor = Address as unknown as new (
            data?: any
          ) => any
          return new AddressConstructor(value)
        },
        function (value) {
          if (!(value instanceof Address)) {
            value = this.cast(value, 'Address')
          }
          return value.toJSON()
        }
      )

      builder.addProps(Person, {
        name: 'string',
        age: 'number',
        address: 'Address',
        contacts: 'array:string',
      })

      const PersonConstructor = Person as unknown as new (data?: any) => any
      const person = new PersonConstructor({
        name: 'John Doe',
        age: '42',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zipCode: '12345',
        },
        contacts: ['email@example.com', '555-1234'],
      })

      // Test property access
      expect(person.name).toBe('John Doe')
      expect(person.age).toBe(42)
      expect(person.address instanceof Address).toBe(true)
      expect(person.address.street).toBe('123 Main St')
      expect(person.contacts).toEqual(['email@example.com', '555-1234'])

      // Test serialization of nested objects
      const serialized = JSON.parse(JSON.stringify(person))
      expect(serialized.address.city).toBe('Anytown')
    })

    test('should combine multiple mixins', () => {
      // Base class
      function Model(this: any, data: any = {}) {
        Object.entries(data).forEach(([key, value]) => {
          if (key in this) {
            this[key] = value
          }
        })
      }

      // Basic properties
      builder.addProps(Model, {
        id: 'number',
        name: 'string',
      })

      // Timestamps mixin
      builder.mixin('timestamps', function (this: ClassBuilder, Class: any) {
        this.addProps(Class, {
          created_at: 'date',
          updated_at: 'date',
        })

        Class.prototype.touch = function () {
          this.updated_at = new Date()
          return this
        }
      })

      // SoftDelete mixin
      builder.mixin('softDelete', function (this: ClassBuilder, Class: any) {
        this.addProps(Class, {
          deleted_at: 'date',
        })

        Class.prototype.delete = function () {
          this.deleted_at = new Date()
          if (typeof this.touch === 'function') {
            this.touch()
          }
          return this
        }

        Class.prototype.restore = function () {
          this.deleted_at = null
          if (typeof this.touch === 'function') {
            this.touch()
          }
          return this
        }

        Class.prototype.isDeleted = function () {
          return !!this.deleted_at
        }
      })

      // Apply both mixins
      builder.apply(Model, 'timestamps')
      builder.apply(Model, 'softDelete')

      const ModelConstructor = Model as unknown as new (data?: any) => any
      const model = new ModelConstructor({
        id: 1,
        name: 'Test Model',
      })

      // Test basic properties
      expect(model.id).toBe(1)
      expect(model.name).toBe('Test Model')

      // Test timestamp mixin
      model.touch()
      expect(model.updated_at instanceof Date).toBe(true)

      // Test softDelete mixin that uses touch() from timestamps
      expect(model.isDeleted()).toBe(false)

      const prevUpdatedAt = model.updated_at

      // Wait a bit to ensure timestamp difference
      jest.advanceTimersByTime(1000)

      model.delete()
      expect(model.isDeleted()).toBe(true)
      expect(model.deleted_at instanceof Date).toBe(true)
      expect(model.updated_at).not.toBe(prevUpdatedAt) // Should update timestamp

      model.restore()
      expect(model.isDeleted()).toBe(false)
      expect(model.deleted_at).toBeNull()
    })
  })
})
