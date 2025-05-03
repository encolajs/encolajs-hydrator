# Collections

Collections in EncolaJS Hydrator provide a powerful way to work with groups of related models. They extend JavaScript arrays with additional methods for filtering, sorting, grouping, and transforming data.

## What are Collections?

Collections are specialized arrays that:

1. **Contain model instances**: They manage groups of the same model type
2. **Type-cast automatically**: They ensure that added items are converted to the correct model type
3. **Provide data operations**: They include methods for filtering, sorting, and transforming
4. **Are partially immutable**: Operations return new collections instead of modifying the original although the collection's items are still existing objects

## Creating a Collection

There are several ways to create collections:

```javascript
import { CastingManager, ClassBuilder } from '@encola/hydrator';

// Setup
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Define a User model
const User = builder.newModelClass({
  id: 'number',
  name: 'string',
  age: 'number'
});

// Create a collection class for Users
const UserCollection = builder.newCollectionClass(User);

// Create a collection instance
const users = new UserCollection([
  { id: 1, name: 'John Doe', age: 28 },
  { id: 2, name: 'Jane Smith', age: 32 },
  { id: 3, name: 'Bob Johnson', age: 45 }
]);

// Each item is automatically converted to a User model
console.log(users[0] instanceof User); // true
```

## Using Collections

Collections provide many powerful methods for working with your data:

```javascript
// Filtering
const adults = users.filterBy('age', '>=', 30);
const johnsOnly = users.filterBy('name', /^John/);

// Sorting
const byAge = users.sortBy('age');
const byNameDesc = users.sortBy('name', 'desc');

// Finding
const john = users.findBy('name', 'John Doe');
const firstAdult = users.findBy(user => user.age >= 18);

// Transformations
const names = users.pluck('name'); // ['John Doe', 'Jane Smith', 'Bob Johnson']
const nameObj = users.keyBy('id');  // { 1: User, 2: User, 3: User }

// Aggregations
const totalAge = users.sum('age');
const averageAge = users.avg('age');
```

For the complete API details, see the [BaseCollection API Reference](../api/base-collection.md). 