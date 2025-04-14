# BaseModel

The `BaseModel` class is the foundation for creating structured data models in the EncolaJS Hydrator library. It provides a robust system for handling, transforming, and serializing data with a focus on extensibility and type safety.

## Core Architecture

BaseModel uses a carefully designed architecture that separates data storage from data access:

1. **Internal Data Container**: All data is stored in a protected `_data` object
2. **Attribute Access Indirection**: All property access goes through getter/setter methods
3. **Custom Attribute Handlers**: Special methods allow customization of how attributes are retrieved, set, and serialized
4. **Type Conversion**: Integration with CastingManager for automatic type conversion

This architecture enables powerful extensibility while maintaining a clean, consistent API.

## Key Concepts

### Attribute Access Flow

When you access a model attribute, the following sequence occurs:

1. **Getter Method**: When reading a property (e.g., `model.name`), the getter calls `getAttribute('name')`
2. **Custom Getter Check**: `getAttribute()` checks for a custom getter method `_get_name()`
3. **Attribute Retrieval**: If no custom getter exists, retrieves the value from `this._data.name`
4. **Default Value Handling**: If the attribute doesn't exist, it's initialized with `null` before retrieval. This is deliberate.

When setting an attribute, a similar flow occurs:

1. **Setter Method**: When setting a property (e.g., `model.name = 'John'`), the setter calls `setAttribute('name', 'John')`
2. **Custom Setter Check**: `setAttribute()` checks for a custom setter method `_set_name(value)`
3. **Type Casting**: If no custom setter exists, the value is cast using `castAttribute('name', value)`
4. **Storage**: The (potentially transformed) value is stored in `this._data.name`

### Custom Attribute Handlers

BaseModel supports three types of custom attribute handlers:

| Handler Type | Method Pattern | Purpose |
|--------------|----------------|---------|
| Getter | `_get_attributeName()` | Customize how an attribute is retrieved |
| Setter | `_set_attributeName(value)` | Customize how an attribute is stored |
| Caster | `_cast_attributeName(value)` | Customize how an attribute is type-cast |
| Serializer | `_serialize_attributeName()` | Customize how an attribute is serialized |

## Basic Usage

```javascript
import { BaseModel } from '@encola/hydrator';

// Create a model class with properties
class User extends BaseModel {
  // Define getters and setters for attributes
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
  
  // Add domain-specific methods
  getDisplayName() {
    return this.name || this.email.split('@')[0];
  }
  
  // Custom getter example: derived property
  get initials() {
    const parts = (this.name || '').split(' ');
    return parts.map(part => part.charAt(0).toUpperCase()).join('');
  }
}

// Create a model instance
const user = new User({
  name: 'John Doe',
  email: 'john@example.com'
});

console.log(user.name); // "John Doe"
console.log(user.initials); // "JD"
console.log(user.getDisplayName()); // "John Doe"

// Update a value
user.name = 'Jane Smith';
console.log(user.name); // "Jane Smith"
console.log(user.initials); // "JS"

// Convert to plain object
const json = user.toJSON();
console.log(json); // { name: "Jane Smith", email: "john@example.com" }

// Clone the model
const clonedUser = user.clone();
```

## Advanced Customization

### Custom Getters and Setters

You can define custom behavior for attribute access with special methods:

```javascript
class Product extends BaseModel {
  get price() {
    return this.getAttribute('price');
  }
  
  set price(value) {
    this.setAttribute('price', value);
  }
  
  // Custom getter that formats the price
  _get_price() {
    const rawPrice = this._data.price || 0;
    return `$${rawPrice.toFixed(2)}`;
  }
  
  // Custom setter that handles different price inputs
  _set_price(value) {
    if (typeof value === 'string') {
      // Remove currency symbols and convert to number
      value = parseFloat(value.replace(/[^0-9.]/g, ''));
    }
    this._data.price = isNaN(value) ? 0 : value;
    // since all we are doing here is ensuring the proper type,
    // the same could be achieved implementing _cast_price(value) instead
  }
}

const product = new Product({ price: '25.99' });
console.log(product.price); // "$25.99"

product.price = '$30.50';
console.log(product.price); // "$30.50"
```

### Custom Type Casting

You can define special caster methods for type conversion:

```javascript
class Task extends BaseModel {
  get dueDate() {
    return this.getAttribute('dueDate');
  }
  
  set dueDate(value) {
    this.setAttribute('dueDate', value);
  }
  
  // Custom type casting for due date
  _cast_dueDate(value) {
    if (value === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else if (value === 'next week') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    } else if (value instanceof Date) {
      return value;
    } else {
      return new Date(value);
    }
  }
}

const task = new Task({ dueDate: 'tomorrow' });
console.log(task.dueDate instanceof Date); // true
```

### Custom Serialization

You can control how attributes are serialized with serializer methods:

```javascript
class User extends BaseModel {
  get password() {
    return this.getAttribute('password');
  }
  
  set password(value) {
    this.setAttribute('password', value);
  }
  
  // Custom serializer to never include password in JSON
  _serialize_password() {
    return undefined; // Exclude from JSON output
  }
  
  get birthdate() {
    return this.getAttribute('birthdate');
  }
  
  set birthdate(value) {
    this.setAttribute('birthdate', value);
  }
  
  // Custom serializer to format dates
  _serialize_birthdate() {
    if (!this._data.birthdate) return null;
    const date = new Date(this._data.birthdate);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}

const user = new User({
  name: 'John',
  password: 'secret123',
  birthdate: new Date(1990, 0, 15)
});

console.log(user.toJSON());
// { name: "John", birthdate: "1990-01-15" }
// Notice password is excluded
```

## Integration with ClassBuilder

While you can manually define getters and setters for every attribute, the ClassBuilder provides a more streamlined approach:

```javascript
import { CastingManager, ClassBuilder, BaseModel } from '@encola/hydrator';

const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Create a model class with typed properties
const Product = builder.newModelClass({
  name: 'string',
  price: 'decimal:2',
  description: 'any', // No type casting here
  category: 'string',
  tags: 'array:string',
  inStock: 'boolean',
  createdAt: 'date'
}, {
  // Add mixins
  timestamps: {},
  softDelete: {}
}, {
  // Add methods
  isDiscounted() {
    return this.salePrice < this.price;
  },
  
  getDisplayPrice() {
    return `$${this.price}`;
  }
});

// Create an instance
const product = new Product({
  name: 'Laptop',
  price: '999.99',
  description: 'Powerful laptop for developers',
  category: 'electronics',
  tags: ['computer', 'laptop', 'tech'],
  inStock: true
});

console.log(product.price); // 999.99 (as number)
console.log(product.tags); // ['computer', 'laptop', 'tech']
console.log(product.created_at instanceof Date); // true
```

The ClassBuilder approach:
- Automatically creates getters and setters
- Handles type casting via CastingManager
- Sets up serialization for each attribute
- Makes properties enumerable for `Object.keys()` and other operations

## Working with Complex Relations

BaseModel can handle complex relationships including nested models and collections:

```javascript
// Assuming we have already defined User and Task models
const User = builder.newModelClass({
  name: 'string',
  email: 'string'
});

const Task = builder.newModelClass({
  title: 'string',
  completed: 'boolean',
  // Reference to assigned user
  assignedTo: 'user'  // This will use the user caster from CastingManager
});

// Register the models with CastingManager
castingManager.registerModel('user', User);
castingManager.registerModel('task', Task);

// Create a task with a nested user
const task = new Task({
  title: 'Implement feature',
  completed: false,
  assignedTo: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});

console.log(task.assignedTo instanceof User); // true
console.log(task.assignedTo.name); // "John Doe"

// Serialization correctly handles nested models
const json = task.toJSON();
console.log(json.assignedTo.name); // "John Doe"
```

## ID Management

The BaseModel provides special handling for model IDs:

```javascript
class Customer extends BaseModel {
  constructor(data) {
    super(data);
    this._idAttribute = 'customerId'; // Override default 'id'
  }
  
  get customerId() {
    return this.getAttribute('customerId');
  }
  
  set customerId(value) {
    this.setAttribute('customerId', value);
  }
}

const customer = new Customer({ customerId: 'C12345' });
console.log(customer.theId()); // "C12345"
```

The `theId()` method is particularly useful when working with collections and  checking for uniqueness, for example when you don't want the same customer added to a collection of customers.

## TypeScript Integration

When using BaseModel with TypeScript, define interfaces to represent your model structure:

```typescript
interface UserData {
  id?: number;
  name: string;
  email: string;
  age?: number;
  preferences?: Record<string, any>;
}

class User extends BaseModel implements UserData {
  declare id?: number;
  declare name: string;
  declare email: string;
  declare age?: number;
  declare preferences?: Record<string, any>;
  
  constructor(data: Partial<UserData> = {}) {
    super(data);
  }
  
  get id() { return this.getAttribute('id'); }
  set id(value) { this.setAttribute('id', value); }
  
  get name() { return this.getAttribute('name'); }
  set name(value) { this.setAttribute('name', value); }
  
  get email() { return this.getAttribute('email'); }
  set email(value) { this.setAttribute('email', value); }
  
  get age() { return this.getAttribute('age'); }
  set age(value) { this.setAttribute('age', value); }
  
  get preferences() { return this.getAttribute('preferences'); }
  set preferences(value) { this.setAttribute('preferences', value); }
  
  getDisplayName(): string {
    return this.name || this.email.split('@')[0];
  }
}
```

## When to Use BaseModel

BaseModel is ideal for:

1. **Structured data**: When you need a consistent structure for data objects
2. **Type conversion**: When data comes from external sources (API, forms) and needs type casting
3. **Data validation**: As a foundation for implementing validation rules
4. **Complex serialization**: When you need custom serialization logic
5. **Domain modeling**: When you want to add behavior to your data objects

## Comparison with Other Approaches

### BaseModel vs Plain Objects

| Feature | BaseModel | Plain Objects |
|---------|-----------|---------------|
| Type Safety | ✅ Built-in with casting | ❌ Requires manual validation |
| Behavior | ✅ Can add methods | ❌ Limited to properties |
| Custom Serialization | ✅ Built-in | ❌ Requires separate logic |
| Memory Overhead | ⚠️ Higher | ✅ Lower |
| Simplicity | ⚠️ More structure | ✅ Simpler |

### BaseModel vs Full ORM

| Feature | BaseModel | Full ORM |
|---------|-----------|----------|
| Database Integration | ❌ Manual | ✅ Built-in |
| Schema Definition | ⚠️ Manual | ✅ Declarative |
| Query Building | ❌ Not included | ✅ Built-in |
| Relationships | ⚠️ Manual | ✅ Declarative |
| Flexibility | ✅ High | ⚠️ Framework-dependent |
| Size | ✅ Lightweight | ❌ Heavier |


