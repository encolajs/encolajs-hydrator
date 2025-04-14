# ClassBuilder

The `ClassBuilder` component of EncolaJS Hydrator provides a powerful and flexible way to create and enhance JavaScript classes with typed properties, custom methods, and reusable functionality through mixins.

## Overview

The `ClassBuilder` allows you to:

1. Define properties with automatic type casting
2. Add methods to classes
3. Apply mixins for reusable functionality
4. Create model and collection classes with a fluent API

## Basic Usage

```javascript
import { CastingManager, ClassBuilder, BaseModel } from '@encola/hydrator';

// Set up the required dependencies
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Create a base class
class Person extends BaseModel {
  constructor(data = {}) {
    super(data);
  }
}

// Enhance the class with the builder
const Person = builder
  .withClass(Person)
  .add('props', {
    firstName: 'string',
    lastName: 'string',
    age: 'number',
    birthdate: 'date'
  })
  .add('methods', {
    getFullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  })
  .build();

// Use the enhanced class
const person = new Person({
  firstName: 'John',
  lastName: 'Doe',
  age: '30', // Will be cast to number
  birthdate: '1993-05-15' // Will be cast to Date
});

console.log(person.getFullName()); // "John Doe"
console.log(person.age); // 30 (as a number)
console.log(person.birthdate instanceof Date); // true
```

## Property Definitions

The `ClassBuilder` allows you to define properties with type information:

```javascript
builder
  .withClass(MyClass)
  .add('props', {
    // Simple string type
    name: 'string',
    
    // Decimal with precision
    price: 'decimal:2',
    
    // Array of numbers
    scores: 'array:number',
    
    // Advanced property with computed value
    fullName: {
      type: 'string',
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
      set(value) {
        const parts = value.split(' ');
        this.firstName = parts[0] || '';
        this.lastName = parts[1] || '';
      }
    }
  })
  .build();
```

> Important! The `props` feature works in a specific way and it might not work with any class. It is best suited for classes that extend `BaseModel`.

## Advanced Property Types

The `add('props', {...})` method supports advanced property definitions:

```javascript
builder
  .withClass(Product)
  .add('props', {
    // Regular property
    name: 'string',
    
    // Property with custom getter/setter
    price: {
      type: 'decimal:2',
      get() {
        // Return price with currency symbol
        return `$${this._data.price || 0}`;
      },
      set(value) {
        // Strip currency symbol and convert to number
        if (typeof value === 'string') {
          value = value.replace(/[^0-9.]/g, '');
        }
        this._data.price = this._castingManager.cast(value, 'decimal:2');
      }
    },
    
    // Computed property (readonly)
    isOnSale: {
      type: 'boolean',
      get() {
        return this.salePrice !== null && this.salePrice < this.price;
      }
    }
  })
  .build();
```

## Creating Model Classes

The `newModelClass` method creates a model class with properties, mixins, and methods:

```javascript
const User = builder.newModelClass(
  // Properties
  {
    name: 'string',
    email: 'string',
    age: 'number',
    isActive: 'boolean'
  },
  // Mixins
  {
    timestamps: {},
    softDelete: {}
  },
  // Methods
  {
    isAdult() {
      return this.age >= 18;
    },
    getDisplayName() {
      return this.name || this.email.split('@')[0];
    }
  }
);

const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  age: '25' // Will be cast to number
});

console.log(user.isAdult()); // true
console.log(user.created_at instanceof Date); // true
```

## Creating Collection Classes

The `newCollectionClass` method creates a collection class for a specific model:

```javascript
// First create a model class
const Product = builder.newModelClass({
  name: 'string',
  price: 'number',
  category: 'string'
});

// Then create a collection class for that model
const ProductCollection = builder.newCollectionClass(
  Product,
  {}, // No mixins in this example
  {
    // Add custom methods to the collection
    getTotalPrice() {
      return this.sum('price');
    },
    filterByCategory(category) {
      return this.filterBy('category', category);
    }
  }
);

// Use the collection
const products = new ProductCollection([
  { name: 'Laptop', price: 1200, category: 'electronics' },
  { name: 'Phone', price: 800, category: 'electronics' },
  { name: 'Desk', price: 350, category: 'furniture' }
]);

console.log(products.getTotalPrice()); // 2350
console.log(products.filterByCategory('electronics').length); // 2
```

## Model Creation vs. Class Enhancement

The `ClassBuilder` provides two approaches to creating enhanced classes:

1. **Model Creation**: Create a new model class using `newModelClass()` which extend the `BaseModel` class
2**Class Enhancement**: Enhance any existing class using `withClass().add().build()`

The class enhancement approach gives you more control and works with any class, while the model creation approach is more concise but requires extending from `BaseModel`.

## Best Practices

1. **Reuse the ClassBuilder**: Create one ClassBuilder instance and reuse it for all your class needs
2. **Leverage mixins**: Create reusable mixins for common functionality
3. **Use meaningful property types**: Take advantage of type parameters (e.g., 'decimal:2', 'array:number')
4. **Combine with CastingManager**: Register custom types in your CastingManager for use in property definitions

## TypeScript and JSDoc Support

When working with ClassBuilder in TypeScript or using JSDoc annotations, you'll want to properly type your dynamically created classes. Since the properties are added at runtime, you might need to define interfaces to represent them:

```typescript
interface User {
  name: string;
  email: string;
  age: number;
  created_at?: Date;
  updated_at?: Date;
  isAdult(): boolean;
  getDisplayName(): string;
}

// Create the model class
const User = builder.newModelClass<User>(
  {
    name: 'string',
    email: 'string',
    age: 'number'
  },
    {
      timestamps: {}
    },
    {
      isAdult() {
        return this.age >= 18;
      },
      getDisplayName() {
        return this.name || this.email.split('@')[0];
      }
    }
);

// TypeScript will recognize this as having all properties and methods
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25
});

// When using the CastingManager you might need to specify the type
const castUser = castingManager.cast<User>(data, 'user');
```

If you are using JSDoc, you can also use `@typedef` to define types for your classes:

```javascript
/**
 * @typedef {Object} User
 * @property {string} name - The user's full name
 * @property {number} age - The user's age
 * @property {string} email - The user's email address
 * @property {Date} created_at - When the user was created
 * @property {Date} updated_at - When the user was last updated
 * @property {() => boolean} isAdult - Checks if the user is an adult
 * @property {() => string} getDisplayName - Gets a display-friendly name
 */

/**
 * User model with typed properties and methods
 * @extends {BaseModel}
 * @implements {User}
 */
const User = builder.newModelClass(
  // Properties
  {
    name: 'string',
    email: 'string',
    age: 'number'
  },
  // Mixins
  {
    timestamps: {}
  },
  // Methods
  {
    /** @returns {boolean} */
    isAdult() {
      return this.age >= 18;
    },
    
    /** @returns {string} */
    getDisplayName() {
      return this.name || this.email.split('@')[0];
    }
  }
);

// When using the class:
/**
 * @type {User & BaseModel}
 */
const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25
});

// When using the CastingManager you might need to specify the type
/**
 * @type {User & BaseModel}
 */
const castUser = castingManager.cast(data, 'user');
```