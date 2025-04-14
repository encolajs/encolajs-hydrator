EncolaJS Hydrator is a lightweight JavaScript library that provides powerful type casting, object hydration, and serialization capabilities. It bridges the gap between plain JavaScript objects and complex class instances, making it ideal for working with API responses, form data, or any scenario where you need to transform data between formats.

## Core Features

- **Type Casting**: Convert values to specific types with built-in or custom casters
- **Object Hydration**: Transform plain objects into typed class instances
- **Serialization**: Convert complex objects back to plain JSON
- **Model Building**: Create model classes with built-in functionality
- **Collection Management**: Work with arrays of model instances through a powerful API

## Library Components

The library consists of four main components that can be used independently or together:

1. [**CastingManager**](./casting-manager.md): The foundation of the library that handles type conversion
2. [**ClassBuilder**](./class-builder.md): Creates and enhances classes with properties, methods, and mixins
3. [**BaseModel**](./base-model.md): A base class for creating data models with built-in functionality
4. [**BaseCollection**](./base-collection.md): An enhanced array class for working with collections of models

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

## Basic Usage

```javascript
import { CastingManager, ClassBuilder, BaseModel, BaseCollection } from '@encola/hydrator';

// Create a casting manager
const castingManager = new CastingManager();

// Create a builder
const builder = new ClassBuilder(castingManager);

// Create a model class
const User = builder.newModelClass({
  name: 'string',
  age: 'number',
  email: 'string',
  createdAt: 'date'
}, {
  // Add mixins
  timestamps: {} 
}, {
  // Add methods
  isAdult() {
    return this.age >= 18;
  }
});

// Create a model instance
const user = new User({
  name: 'John Doe',
  age: '30', // Will be cast to number
  email: 'john@example.com'
});

console.log(user.isAdult()); // true
console.log(user.created_at); // Current date
```

## When to Use EncolaJS Hydrator

- **API Integration**: Convert API responses into strongly-typed model instances
- **Form Handling**: Ensure form inputs are properly cast to appropriate types
- **Data Manipulation**: Work with collections of similar objects with a fluent API
- **Framework-Agnostic**: Use in any JavaScript project, with or without a framework
