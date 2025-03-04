# BaseModel

The `BaseModel` class serves as the foundation for creating data models in the EncolaJS Hydrator library. It provides essential functionality for manipulating, storing, and converting data between plain objects and structured model instances.

## Overview

BaseModel provides:

1. A simple internal data container (`_data`)
2. Methods to fill the model with data
3. ID attribute handling
4. JSON serialization
5. Deep cloning capability

## Basic Usage

```javascript
import { BaseModel } from '@encola/hydrator';

// Create a simple model class
class User extends BaseModel {
  get name() {
    return this._data.name;
  }
  
  set name(value) {
    this._data.name = value;
  }
  
  get email() {
    return this._data.email;
  }
  
  set email(value) {
    this._data.email = value;
  }
  
  getDisplayName() {
    return this.name || this.email.split('@')[0];
  }
}

// Create a model instance
const user = new User({
  name: 'John Doe',
  email: 'john@example.com'
});

console.log(user.name); // "John Doe"
console.log(user.getDisplayName()); // "John Doe"

// Update values
user.name = 'Jane Doe';
console.log(user.name); // "Jane Doe"

// Convert to plain object
const json = user.toJSON();
console.log(json); // { name: "Jane Doe", email: "john@example.com" }
```

## Constructor

The BaseModel constructor accepts an optional data object to initialize the model:

```javascript
const user = new User(); // Empty model
const user = new User(null); // Empty model
const user = new User({ name: 'John' }); // Model with initial data
```

## Model Properties

There are two ways to define properties in a BaseModel class:

### 1. Using getters and setters

```javascript
class Product extends BaseModel {
  get name() {
    return this._data.name;
  }
  
  set name(value) {
    this._data.name = value;
  }
  
  get price() {
    return this._data.price;
  }
  
  set price(value) {
    // Convert to number
    this._data.price = Number(value);
  }
  
  // Computed property
  get priceWithTax() {
    return this.price * 1.2;
  }
}
```

### 2. Using ClassBuilder (recommended)

```javascript
import { CastingManager, ClassBuilder, BaseModel } from '@encola/hydrator';

const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

const Product = builder
  .withClass(class extends BaseModel {})
  .add('props', {
    name: 'string',
    price: 'number',
    description: 'string',
    createdAt: 'date'
  })
  .build();
```

## Key Methods

### `fill(data)`

Updates the model with new data:

```javascript
user.fill({
  name: 'Jane Smith',
  email: 'jane@example.com'
});
```

The `fill` method:
- Updates properties using setters when available
- Adds properties without setters to the `_data` container
- Ignores null or undefined data
- Returns `this` for method chaining

### `theId()`

Gets the ID of the model:

```javascript
class User extends BaseModel {
  constructor(data) {
    super(data);
    this._idAttribute = 'userId'; // Custom ID field (default is 'id')
  }
  
  get userId() {
    return this._data.userId;
  }
  
  set userId(value) {
    this._data.userId = value;
  }
}

const user = new User({ userId: 123 });
console.log(user.theId()); // 123
```

### `toJSON()`

Converts the model to a plain object:

```javascript
const data = user.toJSON();
```

The `toJSON` method:
- Includes all properties from `_data` and defined getters
- Excludes methods and private properties (starting with `_`)
- Returns a plain JavaScript object suitable for JSON serialization

### `clone()`

Creates a deep copy of the model:

```javascript
const original = new User({ name: 'John', email: 'john@example.com' });
const copy = original.clone();

// Modify the copy
copy.name = 'Jane';

// Original remains unchanged
console.log(original.name); // "John"
console.log(copy.name); // "Jane"
```

## Working with TypeScript

When using BaseModel with TypeScript, you can define interfaces to properly type your models:

```typescript
interface UserData {
  id?: number;
  name: string;
  email: string;
  createdAt?: Date;
}

class User extends BaseModel implements UserData {
  get id() { return this._data.id; }
  set id(value) { this._data.id = value; }
  
  get name() { return this._data.name; }
  set name(value) { this._data.name = value; }
  
  get email() { return this._data.email; }
  set email(value) { this._data.email = value; }
  
  get createdAt() { return this._data.createdAt; }
  set createdAt(value) { this._data.createdAt = value; }
}
```

## Why Use BaseModel?

### 1. Data Encapsulation

BaseModel provides a clean way to encapsulate data with proper getters and setters, allowing you to:
- Validate inputs
- Transform data on access
- Keep implementation details private
- Add computed properties

### 2. Consistent Interface

Models derived from BaseModel share a common API:
- Standard constructor
- Filling with data
- JSON serialization
- ID management
- Deep cloning

### 3. Foundation for Mixins

BaseModel is designed to work with the ClassBuilder to easily add mixins:
- Timestamps (created_at, updated_at)
- Soft Delete (deleted_at, isDeleted())
- Custom behaviors via mixins

### 4. Simple Data Management

The internal `_data` container makes it easy to:
- Track which properties have been set
- Add new properties without explicit getters/setters
- Maintain a clear separation between data and methods

## Alternatives to Extending BaseModel

While extending BaseModel provides the most functionality, you may prefer not to use it as a base class. Here are some alternatives:

### 1. Create Your Own BaseModel

```javascript
class MyCustomModel {
  constructor(data = {}) {
    this._data = {};
    this.fill(data);
  }
  
  fill(data) {
    if (!data || typeof data !== 'object') return this;
    Object.assign(this._data, data);
    return this;
  }
  
  toJSON() {
    return {...this._data};
  }
  
  // Add other methods as needed
}
```

### 2. Use ClassBuilder with Any Class

```javascript
class PlainClass {
  constructor(data = {}) {
    this.data = data;
  }
}

const EnhancedClass = builder
  .withClass(PlainClass)
  .add('props', {
    name: 'string',
    email: 'string'
  })
  .build();
```

### 3. Use Factory Functions Instead of Classes

```javascript
function createUser(data = {}) {
  const user = {
    _data: {...data},
    
    get name() {
      return this._data.name;
    },
    
    set name(value) {
      this._data.name = value;
    },
    
    toJSON() {
      return {...this._data};
    }
  };
  
  return user;
}
```

## Best Practices

1. **Use ClassBuilder**: While you can create models manually with getters and setters, the ClassBuilder provides type casting and mixins.

2. **Keep models focused**: Each model should represent a single entity or concept.

3. **Add meaningful methods**: Include methods that provide behavior relevant to the model.

5. **Consider performance**: For applications with thousands of model instances, be mindful of memory usage.

6. **Document with JSDoc or TypeScript**: Define interfaces for your models to improve developer experience.

7. **Use mixins**: Create base models for shared functionality and mixins for specific behaviors.

8. **Use computed properties**: Add getters for derived values instead of storing them.