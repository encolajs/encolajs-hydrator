# BaseCollection

The `BaseCollection` class extends JavaScript's native Array to provide a powerful, fluent API for working with collections of model instances or other data. It offers functionality for filtering, sorting, grouping, aggregating, and transforming collections.

## Overview

BaseCollection provides:

1. Automatic typecasting of items
2. Methods for adding and removing items while preventing duplicates
3. Aggregation functions (sum, min, max, avg)
4. Filtering and sorting capabilities
5. Data transformation methods
6. JSON serialization
7. Deep cloning

## Basic Usage

```javascript
import { BaseCollection, BaseModel } from '@encola/hydrator';

// Create a model class
class Product extends BaseModel {
  get id() { return this._data.id; }
  set id(value) { this._data.id = value; }

  get name() { return this._data.name; }
  set name(value) { this._data.name = value; }

  get price() { return this._data.price; }
  set price(value) { this._data.price = Number(value); }

  get category() { return this._data.category; }
  set category(value) { this._data.category = value; }
}

// Create a collection class
class ProductCollection extends BaseCollection {
  constructor(items = []) {
    // Pass a casting function to convert plain objects to Product instances
    super(items, (item) => {
      if (item instanceof Product) {
        return item;
      }
      return new Product(item);
    });
  }
}

// Create a collection with initial items
const products = new ProductCollection([
  { id: 1, name: 'Laptop', price: 1200, category: 'electronics' },
  { id: 2, name: 'Phone', price: 800, category: 'electronics' },
  { id: 3, name: 'Desk', price: 350, category: 'furniture' }
]);

// Collection automatically casts items to Product instances
console.log(products[0] instanceof Product); // true
console.log(products.length); // 3
```

## Creating Collections

There are several ways to create a collection:

### 1. Extending the BaseCollection Class

```javascript
class UserCollection extends BaseCollection {
  constructor(items = []) {
    super(items, (item) => new User(item));
  }

  // Add custom methods
  findByEmail(email) {
    return this.findBy('email', email);
  }
}

const users = new UserCollection([
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]);
```

### 2. Using ClassBuilder and CastingManager

```javascript
import { CastingManager, ClassBuilder } from '@encola/hydrator';

const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// First create a model class
const Task = builder.newModelClass({
  id: 'number',
  title: 'string',
  completed: 'boolean',
  priority: 'number'
});

// Then create a collection class for the model
const TaskCollection = builder.newCollectionClass(
  Task,
  {}, // No mixins in this example
  {
    // Add custom methods
    getHighPriority() {
      return this.filterBy((task) => task.priority > 3);
    },
    getCompleted() {
      return this.filterBy('completed', true);
    }
  }
);

const tasks = new TaskCollection([
  { id: 1, title: 'Learn JS', completed: true, priority: 4 },
  { id: 2, title: 'Build app', completed: false, priority: 5 }
]);
```

You can also register your models and collections with the CastingManager for seamless type casting:

```javascript
// Register the model and collection with the CastingManager
castingManager.registerModel('task', Task, TaskCollection);
// this will actually register 2 casters: `task` and `taskCollection`

// Now you can cast objects to Task instances
const plainObject = { id: 3, title: 'New task', completed: false, priority: 2 };
const task = castingManager.cast(plainObject, 'task'); // Returns a Task instance

// Cast an array of objects to a TaskCollection
const plainArray = [
  { id: 4, title: 'First task', completed: false, priority: 3 },
  { id: 5, title: 'Second task', completed: true, priority: 4 }
];
const collection = castingManager.cast(plainArray, 'taskCollection'); // Returns a TaskCollection

// This is especially useful when processing API responses
async function fetchTasks() {
  const response = await fetch('/api/tasks');
  const data = await response.json();
  return castingManager.cast(data, 'taskCollection');
}
```

> Note! If you do not provide a collection class to the `registerModel` method, one will still be registered, but it will be a simple `BaseCollection` that will contain only Model classes.

## Adding and Removing Items

### Adding Items

The BaseCollection prevents duplicates based on item IDs:

```javascript
// Add a single item
products.add({ id: 4, name: 'Headphones', price: 150 });

// Try to add a duplicate (will be ignored)
products.add({ id: 1, name: 'Duplicate Laptop', price: 999 });

// Add multiple items with push
products.push(
  { id: 5, name: 'Mouse', price: 50 },
  { id: 6, name: 'Keyboard', price: 80 }
);

// Add items at the beginning
products.unshift({ id: 7, name: 'Monitor', price: 300 });
```

### Removing Items

```javascript
// Remove by ID
products.remove(1); // Removes the item with id=1

// Remove by reference
const item = products[0];
products.remove(item);
```

## Filtering and Finding

```javascript
// Filter by property value
const electronics = products.filterBy('category', 'electronics');

// Filter with a callback function
const expensive = products.filterBy(product => product.price > 500);

// Filter in place (modifies original collection)
products.filterBy('category', 'electronics', true);

// Find a single item by property
const desk = products.findBy('name', 'Desk');

// Find with a callback
const firstExpensive = products.findBy(product => product.price > 500);
```

## Sorting

```javascript
// Sort by property (ascending)
const byPrice = products.sortBy('price');

// Sort by property (descending)
const byPriceDesc = products.sortBy('price', 'desc');

// Sort with a custom function
const byNameLength = products.sortBy((a, b) => a.name.length - b.name.length);

// Sort in place
products.sortBy('price', 'asc', true);
```

## Aggregation Methods

```javascript
// Calculate sum
const totalPrice = products.sum('price');
const weightedPrice = products.sum(item => item.price * item.quantity);

// Find minimum value
const cheapestPrice = products.min('price');

// Find maximum value
const mostExpensive = products.max('price');

// Calculate average
const avgPrice = products.avg('price');
```

## Grouping

```javascript
// Group by category
const byCategory = products.groupBy('category');
console.log(byCategory.electronics); // Array of electronics
console.log(byCategory.furniture); // Array of furniture

// Group with a custom function
const byPriceRange = products.groupBy(item => {
  if (item.price < 100) return 'budget';
  if (item.price < 500) return 'mid-range';
  return 'premium';
});
```

## Transformation Methods

```javascript
// Convert to plain array
const array = products.toArray();

// Get first N items
const topThree = products.head(3);

// Get last N items
const lastTwo = products.tail(2);

// Organize into rows
const rows = products.toRows(2); // [[item1, item2], [item3, item4], ...]

// Organize into columns
const columns = products.toColumns(3); // [[item1, item4, ...], [item2, item5, ...], [item3, item6, ...]]

// Regular array map method
const names = products.map(item => item.name);
```

## JSON Serialization

```javascript
// Convert all items to plain objects
const json = products.toJSON();
console.log(JSON.stringify(json)); // For sending to an API
```

## Deep Cloning

```javascript
// Create a deep copy of the collection with all items cloned
const copy = products.clone();

// Modify the copy without affecting the original
copy[0].name = 'Modified Name';
console.log(products[0].name); // Original name unchanged
```

## TypeScript Integration

```typescript
// Define item type
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

// Create a typed collection
class ProductCollection extends BaseCollection<Product> {
  constructor(items: Product[] = []) {
    super(items, (item: any) => {
      if (item instanceof ProductModel) {
        return item;
      }
      return new ProductModel(item);
    });
  }
  
  // Methods are properly typed
  findByCategory(category: string): ProductCollection {
    return this.filterBy('category', category) as ProductCollection;
  }
}
```

## Native Array Methods

BaseCollection extends Array, so all native array methods are available:

```javascript
// Using native array methods
products.forEach(item => console.log(item.name));
const filtered = products.filter(item => item.price > 100);
const total = products.reduce((sum, item) => sum + item.price, 0);
const someExpensive = products.some(item => item.price > 1000);
const allInStock = products.every(item => item.inStock);
const sliced = products.slice(1, 3);
```

## Available Methods

BaseCollection provides numerous methods for working with collections:

### Core Array Extensions
- `add(item)`: Adds an item if not already present
- `remove(itemOrId)`: Removes an item by reference or ID
- `push(...items)`: Adds multiple items (preventing duplicates)
- `unshift(...items)`: Adds multiple items at the beginning

### Finding and Filtering
- `findBy(attributeOrFunction, value?)`: Finds a single item
- `filterBy(attributeOrFunction, value?, inPlace?)`: Filters the collection

### Sorting
- `sortBy(attributeOrFunction, direction?, inPlace?)`: Sorts the collection

### Aggregation
- `sum(attributeOrGetter)`: Calculates sum
- `min(attributeOrGetter)`: Finds minimum value
- `max(attributeOrGetter)`: Finds maximum value
- `avg(attributeOrGetter)`: Calculates average

### Grouping
- `groupBy(attributeOrGetter)`: Groups items by attribute or function result

### Transformation
- `toArray()`: Converts to plain array
- `head(n)`: Gets first N items
- `tail(n)`: Gets last N items
- `toRows(itemsPerRow)`: Organizes into rows
- `toColumns(numColumns)`: Organizes into columns
- `toJSON()`: Converts to array of plain objects
- `clone()`: Creates a deep copy

## Why Use BaseCollection?

### 1. Rich API
BaseCollection provides a rich, fluent API for working with collections of items, far beyond what native Arrays offer.

### 2. Type Casting
Items are automatically cast to the correct type, ensuring consistency within the collection.

### 3. ID-Based Operations
BaseCollection can prevent duplicates and perform operations based on item IDs.

### 4. Consistent Interface
Collections derived from BaseCollection share a common API, making your code more predictable.

### 5. Chainable Methods
Many methods return a new collection, allowing for method chaining:

```javascript
const result = products
  .filterBy('category', 'electronics')
  .sortBy('price', 'desc')
  .head(3);
```

## Best Practices

1. **Create specialized collections**: Extend BaseCollection for specific model types.

2. **Use with BaseModel**: BaseCollection works best with models extending BaseModel.

3. **Leverage ClassBuilder**: Use ClassBuilder to create both model and collection classes.

4. **Be mindful of performance**: For very large collections, consider which operations might be expensive.

5. **Use method chaining**: Take advantage of chainable methods for expressive transformations.

6. **Consider immutability**: Most methods create new collections by default, preserving the original.

7. **Add domain-specific methods**: Extend collections with methods specific to your application domain.

8. **Document with JSDoc or TypeScript**: Define interfaces for your collections to improve developer experience.