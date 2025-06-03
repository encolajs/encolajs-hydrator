# BaseCollection

The `BaseCollection` class is the foundation for creating and handling array of data models in the EncolaJS Hydrator library. It provides a robust system for handling, transforming, and serializing data with a focus on extensibility and type safety.

## Adding Items

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

## Removing Items

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
const mostExpensive = products.findBy(product => product.price > 500);
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

// Array manipulation methods with proper type casting
const sliced = products.slice(1, 3); // Returns a new BaseCollection
const spliced = products.splice(1, 2, newItem1, newItem2); // Casts new items
```


## Why Use BaseCollection?

1. **Rich API** - BaseCollection provides a rich, fluent API for working with collections of items, far beyond what native Arrays offer.

2. **Type Casting** - Items are automatically cast to the correct type, ensuring consistency within the collection.

3. **ID-Based Operations** - BaseCollection can prevent duplicates and perform operations based on item IDs.

4. **Consistent Interface** - Collections derived from BaseCollection share a common API, making your code more predictable.

5. **Chainable Methods** - Many methods return a new collection, allowing for method chaining:

```javascript
const result = products
  .filterBy('category', 'electronics')
  .sortBy('price', 'desc')
  .head(3);
```