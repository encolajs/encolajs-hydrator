# CastingManager

The `CastingManager` is the central component of the EncolaJS Hydrator library. It:

1. Maintains a registry of caster functions
2. Provides a consistent interface for type conversion
3. Handles edge cases like null/undefined values

## Basic Usage

```javascript
import { CastingManager } from '@encola/hydrator';

// Create a new casting manager (comes with built-in casters)
const castingManager = new CastingManager();

// Use it to cast values
const num = castingManager.cast('123', 'number'); // 123
const bool = castingManager.cast('yes', 'boolean'); // true
const date = castingManager.cast('2023-01-15', 'date'); // Date object
```

## Type Specifications

The `cast()` method accepts a type specification string that can include:

- Simple types: `'number'`, `'boolean'`, `'string'`, `'date'`
- Parameterized types: `'decimal:2'` (number with 2 decimal places)
- Array types: `'array:number'` (array of numbers)

```javascript
// Simple type
const num = castingManager.cast('123.456', 'number'); // 123.456

// Parameterized type
const price = castingManager.cast('123.456', 'decimal:2'); // 123.46

// Array type
const numbers = castingManager.cast(['1', '2', '3'], 'array:number'); // [1, 2, 3]
```

## Working with Models (i.e. Smart Objects)

The `CastingManager` also serves as a registry for your model classes:

```javascript
// Register a model class
castingManager.registerModel('user', UserModel, UserCollection);

// Use it to cast objects to model instances
const userData = { name: 'John', age: '30' };
const user = castingManager.cast(userData, 'user'); // UserModel instance

// Cast arrays to collections
const usersArray = [{ name: 'John' }, { name: 'Jane' }];
const users = castingManager.cast(usersArray, 'userCollection'); // UserCollection instance
```

For complete API details, see the [CastingManager API Reference](../api/casting-manager.md). 