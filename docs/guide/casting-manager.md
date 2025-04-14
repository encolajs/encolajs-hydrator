# CastingManager

The `CastingManager` is the foundation of the EncolaJS Hydrator library. It provides a robust system for converting values from one type to another with consistent handling of edge cases.

## Overview

The `CastingManager` maintains a registry of casting functions that can transform values from any type to a specific target type. It includes built-in casters for common types and allows you to register custom casters for your specific needs.

## Basic Usage

```javascript
import { CastingManager } from '@encola/hydrator';

// Create a casting manager
const castingManager = new CastingManager();

// Use built-in casters
const numberValue = castingManager.cast('123', 'number'); // 123
const boolValue = castingManager.cast('true', 'boolean'); // true
const dateValue = castingManager.cast('2023-01-15', 'date'); // Date object
```

## Built-in Casters

The `CastingManager` comes with the following built-in casters:

| Type    | Example Usage                                                                       | Result                           |
|--------------------------------------------------------------|-------------------------------------------------------------------------------------|----------------------------------|
| `boolean`, `bool`<br/>Converts value to boolean | `.cast("true", "boolean")`<br/>`.cast("1", "boolean")`<br/>`.cast(true, "boolean")` | `true`<br/>`true`<br/>`true`     |
| `number`<br/>Converts value to number | `.cast("123", "number")`                                                            | `123`                            |
| `decimal`<br/>Converts to number with specified precision | `.cast("123.456", "decimal:2")`                                                     | `123.46`                         |
| `string`<br/>Converts value to string | `.cast(123, "string")`                                                              | `"123"`                          |
| `array`<br/>Ensures value is an array | `.cast("test", "array")`                                                            | `["test"]`                       |
| `array:{type}`<br/>Array with elements cast to specified type | `.cast(["123", "456"], "array:number")`                                             | `[123, 456]`                     |
| `date`<br/>Converts to Date object | `.cast("2023-01-15", "date")`                                                       | `Date(2023-01-15)`               |
| `datetime`<br/>Converts to Date with time | `.cast("2023-01-15T14:30:45.000Z", "datetime")`                                     | `Date(2023-01-15T14:30:45.000Z)` |

## Registering Custom Casters

You can register custom casters to handle specific data types:

```javascript
// Register a custom caster for email addresses
castingManager.register('email', function(value) {
  if (value === null || value === undefined) {
    return null;
  }
  
  const strValue = String(value).trim().toLowerCase();
  
  // Basic email validation
  if (!/\S+@\S+\.\S+/.test(strValue)) {
    return '';
  }
  
  return strValue;
});

// Use the custom caster
const email = castingManager.cast('  User@Example.com  ', 'email'); // "user@example.com"
```

## Serialization Support

Along with casting, `CastingManager` also supports serialization to convert complex objects back to simple values:

```javascript
// Register a custom caster with serialization support
castingManager.register(
  'person',
  // Cast function
  function(value) {
    return {
      name: this.cast(value.full_name || '', 'string'),
      age: this.cast(value.age || 0, 'number')
    };
  },
  // Serialize function
  function(value) {
    return {
      full_name: value.name,
      age: value.age
    };
  }
);

// Create and serialize a person
const person = castingManager.cast({ full_name: 'John Doe', age: '30' }, 'person');
// { name: "John Doe", age: 30 }

const serialized = castingManager.serialize(person, 'person');
// { full_name: "John Doe", age: 30 }
```

## Type Parameters

Some casters support additional parameters to customize their behavior:

```javascript
// Decimal with 3 decimal places
const price = castingManager.cast('123.4567', 'decimal:3'); // 123.457

// Array of numbers
const numbers = castingManager.cast(['1', '2', '3'], 'array:number'); // [1, 2, 3]
```

## API Reference

### Constructor

```javascript
const castingManager = new CastingManager();
```

Creates a new casting manager with built-in casters.

### Methods

#### `register(type, castFn, serializeFn?)`

Registers a new caster function for the specified type.

- `type` (string): The name of the type
- `castFn` (function): Function that converts values to the specified type
- `serializeFn` (function, optional): Function that serializes values of this type

#### `registerModel(type, ModelClass, CollectionClass?)`

Registers a model class for casting and (optionally) a collection class. More on this on the [BaseModel](base-model.md) and [BaseCollection](base-collection.md) documentation.

- `type` (string): The type name
- `ModelClass` (class): The model class (typically extends BaseModel)
- `CollectionClass` (class, optional): Collection class for arrays of this model

#### `cast(value, typeSpec)`

Casts a value to the specified type.

- `value` (any): The value to cast
- `typeSpec` (string): Type specification (e.g., 'number', 'decimal:2', 'array:string')

#### `serialize(value, typeSpec)`

Serializes a complex value back to a simpler representation.

- `value` (any): The value to serialize
- `typeSpec` (string): Type specification

## Error Handling

The `CastingManager` is designed to be forgiving and will not throw errors during casting:

- If a caster for a requested type doesn't exist, it returns the original value
- If an error occurs during casting, it logs the error and returns the original value
- For nullable inputs (`null` or `undefined`), most casters return `null`

## Best Practices

1. **Register custom casters early**: Register all your custom casters when initializing your application
2. **Keep casters pure**: Avoid side effects in casting functions
3. **Handle `null`/`undefined` values**: Always handle `null`/`undefined` values in your custom casters/serializers
4. **Use serialization**: Implement serialization functions for custom types when needed
5. **Use type parameters**: Leverage the parameter system for configurable casters