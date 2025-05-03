# Getting Started

EncolaJS Hydrator is a lightweight JavaScript library that provides powerful type casting, object hydration, and serialization capabilities. It bridges the gap between plain JavaScript objects and complex class instances, making it ideal for working with API responses, form data, or any scenario where you need to transform data between formats.


## When to Use EncolaJS Hydrator

- **API Integration**: Convert API responses into strongly-typed model instances
- **Form Handling**: Ensure form inputs are properly cast to appropriate types
- **Data Manipulation**: Work with collections of similar objects with a fluent API
- **Framework-Agnostic**: Use in any JavaScript project, with or without a framework

## Installation

::: code-group
```shell [npm]
npm i @encolajs/hydrator
```

```shell [yarn]
yarn add @encolajs/hydrator
```

```shell [pnpm]
pnpm add @encolajs/hydrator
```
:::

## Quick Example

```javascript
import { CastingManager, ClassBuilder } from '@encola/hydrator';

// Setup the core components
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Create a model class
const User = builder.newModelClass({
  name: 'string',
  age: 'number',
  email: 'string',
  createdAt: 'date'
});

// Create a model instance
const user = new User({
  name: 'John Doe',
  age: '30', // Will be cast to number
  email: 'john@example.com',
  createdAt: '2023-01-15'
});

console.log(user.name); // "John Doe"
console.log(user.age); // 30 (number, not string)
console.log(user.createdAt); // Date object
```

## Learning Path

We recommend exploring EncolaJS Hydrator in this order:

1. **[Type Casting Basics](./type-casting/index.md)**: Understanding the core of data transformation
   - [CastingManager](./type-casting/casting-manager.md): The foundation of type conversion
   - [Built-in Casters](./type-casting/built-in-casters.md): Ready-to-use data converters
   - [Custom Casters](./type-casting/custom-casters.md): Creating your own type converters

2. **[Working with Models](./models/index.md)**: Structuring your data
   - [BaseModel](./models/base-model.md): Creating rich data models
   - [Best practices](./models/best-practices.md): Advice on how to handle special use-cases

3. **[Collections](./collections/index.md)**: Managing groups of models
   - [BaseCollection](./collections/base-collection.md): Working with arrays of models

4. **Advanced Topics**: Taking it further
   - [ClassBuilder](./advanced/class-builder.md): Factory for creating model and collection classes
   - [Mixins](./advanced/mixins.md): Extending functionality with composable pieces
