# @encolajs/hydrator

🚀 A powerful, flexible data transformation library that makes type casting, object hydration, and collections management a breeze! Built with TypeScript and designed with developer experience in mind.

![CI](https://github.com/encolajs/encolajs-hydrator/workflows/CI/badge.svg)
[![npm version](https://img.shields.io/npm/v/@encola/hydrator.svg)](https://www.npmjs.com/package/@encola/hydrator)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Why EncolaJS Hydrator?

- ✨ **Seamless Type Casting**: Convert values between types automatically
- 🌳 **Model Hydration**: Transform plain objects into rich class instances
- 🔄 **Smart Collections**: Filter, sort, group, and aggregate with a fluent API
- 🏗️ **Extensible Architecture**: Create custom casters and mixins
- 🌍 **Framework Agnostic**: Use with any JavaScript project
- 🪶 **Modular**: Use components together or independently

## Quick Start

```bash
npm install @encola/hydrator
```

## Simple Example

```javascript
import { CastingManager, ClassBuilder } from '@encola/hydrator';

// Setup core components
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Create a model class
const User = builder.newModelClass({
  id: 'number',
  name: 'string',
  email: 'string',
  lastLogin: 'date'
});

// Create a collection class
const UserCollection = builder.newCollectionClass(User);

// Register for easy hydration
castingManager.registerModel('user', User, UserCollection);

// Use in your application
async function fetchUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();
  // Automatically converts to User instances in a UserCollection
  return castingManager.cast(data, 'userCollection');
}
```

## Core Features

### CastingManager

Intelligent type conversion with built-in and custom casters:

```javascript
castingManager.cast('123', 'number'); // 123
castingManager.cast('2023-01-15', 'date'); // Date object
castingManager.cast(['1', '2'], 'array:number'); // [1, 2]
```

### BaseModel

Build structured data models with automatic serialization:

```javascript
const product = new Product({
  name: 'Laptop',
  price: '1299.99', // Automatically converted to number
  inStock: 'true'   // Automatically converted to boolean
});

console.log(product.toJSON()); // Serialized for server API
```

### BaseCollection

Supercharged arrays with powerful data operations:

```javascript
const electronics = products.filterBy('category', 'electronics');
const expensive = products.filterBy(p => p.price > 1000);
const byPrice = products.sortBy('price', 'desc');
const total = products.sum('price');
const grouped = products.groupBy('category');
```

## Documentation

[www.encolajs.com/hydrator/](https://www.encolajs.com/hydrator/)

## Contributing

We'd love your help improving @encolajs/hydrator! Check out our [Contributing Guide](./CONTRIBUTING.md) to get started.

Found a bug? [Open an issue](https://github.com/encolajs/validator/issues/new?template=bug_report.md)

Have a great idea? [Suggest a feature](https://github.com/encolajs/validator/issues/new?template=feature_request.md)

## License

MIT © [EncolaJS](https://github.com/encolajs)

---

Built with ❤️ by the EncolaJS team