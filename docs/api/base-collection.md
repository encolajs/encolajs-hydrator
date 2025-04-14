# BaseCollection API Reference

## Constructor

```javascript
const castingManager = new BaseCollection([], castingFn);
```

Creates a new casting manager with built-in casters. Any new item inserted into the collection is casted using the `castingFn` function

## Methods
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
- `toRows(itemsPerRow)`: Organizes the items into rows (each representing an array)
- `toColumns(numColumns)`: Organizes the items into columns
- `toJSON()`: Converts to array of plain objects
- `clone()`: Creates a deep copy

