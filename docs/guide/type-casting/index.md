# Type Casting Basics

Type casting is the foundation of EncolaJS Hydrator. It's the process of converting values from one type to another - for example, converting strings to numbers, dates, booleans, or custom types.

## Why Type Casting?

In web applications, data often comes from external sources like:

- API responses (usually JSON)
- Form inputs (always strings)
- URL parameters (always strings)
- Local storage (serialized values)

All these sources provide data in formats that may not match what your application expects. Type casting solves this problem by automatically converting values to the appropriate types.

## Core Concepts

The type casting system in EncolaJS Hydrator consists of three main components:

1. **[CastingManager](./casting-manager.md)**: The central registry for all casters
2. **[Built-in Casters](./built-in-casters.md)**: Ready-to-use converters for common types
3. **[Custom Casters](./custom-casters.md)**: User-defined converters for specific needs

## Simple Example

```javascript
import { CastingManager } from '@encola/hydrator';

// Create a casting manager
const castingManager = new CastingManager();

// Basic type casting
const num = castingManager.cast('123', 'number'); // 123 (number)
const bool = castingManager.cast('true', 'boolean'); // true (boolean)
const date = castingManager.cast('2023-01-15', 'date'); // Date object

// Array casting with element type
const numbers = castingManager.cast(['1', '2', '3'], 'array:number'); // [1, 2, 3]
```

The next pages will explain each component of the type casting system in detail. 