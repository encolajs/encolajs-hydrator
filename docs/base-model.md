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
    return this.getAttribute('name');
  }
  
  set name(value) {
    this.setAttribute('name', value);
  }
  
  get email() {
    return this.getAttribute('email');
  }
  
  set email(value) {
    this.setAttribute('email', value);
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

1. All data for the properties are hidden inside the model's `_data` object
2. In order to get or set a value in the `_data` object, you need to use the `getAttribute` and `setAttribute` methods
3. The `getAttribute(name)` looks for method `_get_${name}()` method and falls back to `this._data[name]`
4. The `setAttribute(name, value)` looks for `_set_${name}(value)` method and falls back to `this._data[name] = value`

```javascript
class Product extends BaseModel {
  get price() {
    return this.getAttribute('price');
  }
  
  set price(value) {
    this.setAttribute('price', Number(value));
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

This method would add the properties and their getters and setters to the class automatically. It will also set the `_set_${attribute}()` methods that call the Casting Manager to cast the value to the correct type.

## Key Methods

### `setAttributes(data)`

Updates the model with new data:

```javascript
user.setAttributes({
  name: 'Jane Smith',
  email: 'jane@example.com'
});
```

The `setAttributes` method:
- Updates properties using setters when available
- Adds properties without setters to the `_data` container
- Returns `this` for method chaining

### `setAttribute(name, value)`

This method is used to set a single attribute:

```javascript
user.setAttribute('name', 'Jane Smith');
// this is equivalent to
user.name = 'Jane Smith';
```

### `setAttribute(name, value)`

This method is used to set a single attribute:

```javascript
user.setAttribute('name', 'Jane Smith').setAttribute('email', 'jane@smith.com');
// this is equivalent to
user.name = 'Jane Smith';
user.email = 'jane@smith.com'
```

### `getAttribute(name)`

```javascript
const name = user.getAttribute('name');
// this is equivalent to
const name = user.name;
```

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
- Transform data on access
- Ensure proper data types
- Keep implementation details private

### 2. Consistent Interface

Models derived from BaseModel share a common API:
- Standard constructor
- Filling with data
- JSON serialization
- ID management
- Deep cloning

### 3. Foundation for Mixins

BaseModel is designed to work with the ClassBuilder to easily add mixins:
- Timestamps: adds `created_at`, `updated_at` attributes and `touch()` method
- SoftDelete: adds `deleted_at` attribute, `delete()`, `isDeleted()` and `restore()` method
- You can create your own mixins for other common functionality

### 4. Easy extensibility

- Overwriting the `_get_${name}()` and `_set_${name}(value)` methods allows you to customize how model's attributes are accessed, stored (inside or outside the `_data` object) and how the values are transformed before being stored.
- Overwriting the `_serialize_${name}()` methods allows you to customize how attributes are converted for  the `toJSON()` method.
- Overwriting the default `setAttribute()` method allows you to inject custom logic when setting an attribute (like logging, triggering events etc.).

## Alternatives to Extending BaseModel

The BaseModel class is not the only way to create models in EncolaJS Hydrator but it provides a solid foundation for building typed models. 

> Note! The `add('props', { ... })` method, the `soft_delete` and `timestamps` mixins in the ClassBuilder work only with classes that extend BaseModel because it requires the presence of specific methods and properties.

If you don't want to use the BaseModel you will have to create your own base classes and mixins:

```javascript
class PlainClass {
  constructor(data = {}) {
    this.data = data;
  }
}

builder.register('data_props', /* Custom Mixin for attaching props to classes goes here */);

const EnhancedClass = builder
  .add('data_props', {
    name: 'string',
    email: 'string'
  })
  .build();
```

## Best Practices

1. **Use ClassBuilder**: While you can create models manually with getters and setters, the ClassBuilder provides type casting and mixins.

2. **Keep models focused**: Each model should represent a single entity or concept.

3. **Add meaningful methods**: Include methods that provide behavior relevant to the model.

5. **Consider performance**: For applications with thousands of model instances, be mindful of memory usage.

6. **Document with JSDoc or TypeScript**: Define interfaces for your models to improve developer experience.

7. **Use mixins**: Create base models for shared functionality and mixins for specific behaviors.

8. **Use computed properties**: Add getters for derived values instead of storing them.
