# Working with Models

Models are the core building blocks of your application's data structure in EncolaJS Hydrator. A model represents a single entity (like a user, product, or order) with typed properties and behaviors.

## What are Models?

In EncolaJS Hydrator, models are:

1. **Strongly typed**: Properties are automatically converted to their correct types
2. **Self-validating**: They can validate their own data integrity
3. **Enhanced**: They can include methods and computed properties
4. **Serializable**: They can be converted back to plain objects for APIs or storage

## Creating a Model Class

The simplest way to create a model class is with the `ClassBuilder`:

```javascript
import { CastingManager, ClassBuilder } from '@encola/hydrator';

// Setup
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Define a User model class
const User = builder.newModelClass({
  id: 'number',
  name: 'string',
  email: 'string',
  isActive: 'boolean',
  registeredAt: 'date'
});

// Create an instance
const user = new User({
  id: '123',        // Will be cast to number
  name: 'John Doe',
  email: 'john@example.com',
  isActive: 'true', // Will be cast to boolean
  registeredAt: '2023-01-15' // Will be cast to Date
});

console.log(user.id); // 123 (number)
console.log(user.isActive); // true (boolean)
console.log(user.registeredAt); // Date object
```

## Model Features

EncolaJS Hydrator models offer several powerful features:

- **Automatic Type Casting**: Properties are cast to their defined types
- **Validation**: Ensure data integrity with validation rules
- **Computed Properties**: Define properties that are calculated from other properties
- **Custom Methods**: Add business logic directly to your models
- **Events**: React to changes in your models
- **Serialization**: Convert models to plain objects for APIs

- For the complete API details, see the [BaseModel API Reference](../api/base-model.md). 