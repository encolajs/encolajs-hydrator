# BaseModel API Reference

The `BaseModel` class is the foundation for all model classes in EncolaJS Hydrator. It provides a robust system for managing typed properties, handling data conversion, and serialization.

## Constructor

```typescript
constructor(data?: Record<string, any> | null)
```

Creates a new model instance with the provided data.

- `data` (optional): An object containing initial property values. If not provided, an empty object is used.

## Properties

### `_idAttribute`

```typescript
protected _idAttribute: string = 'id'
```

The name of the property that serves as the model's unique identifier. Defaults to 'id'.

### `_data`

```typescript
protected _data: Record<string, any> = {}
```

Internal storage for model attributes. This property is protected and should not be accessed directly in most cases.

## Methods

### `setAttributes(attributes)`

```typescript
setAttributes(attributes: Record<string, any> | undefined | null): this
```

Sets multiple attributes at once.

- `attributes`: An object containing property names and values
- Returns: The model instance for method chaining

### `getAttributes()`

```typescript
getAttributes(): Record<string, any>
```

Returns all attributes as a plain object.

- Returns: An object containing all model attributes

### `getAttribute(key)`

```typescript
getAttribute(key: string): any
```

Gets the value of a specific attribute.

- `key`: The name of the attribute to retrieve
- Returns: The attribute value

If the attribute doesn't exist, it will be initialized with `null`. If a custom getter method exists (named `_get_${key}`), it will be used instead.

### `setAttribute(key, value)`

```typescript
setAttribute(key: string, value: any): this
```

Sets the value of a specific attribute.

- `key`: The name of the attribute to set
- `value`: The value to set
- Returns: The model instance for method chaining

If a custom setter method exists (named `_set_${key}`), it will be used instead.

### `castAttribute(key, value)`

```typescript
castAttribute(key: string, value: any): any
```

Converts a value to the appropriate type for an attribute.

- `key`: The name of the attribute
- `value`: The value to cast
- Returns: The casted value

If a custom caster method exists (named `_cast_${key}`), it will be used instead.

### `serializeAttribute(key)`

```typescript
serializeAttribute(key: string): any
```

Converts an attribute value to a format suitable for serialization.

- `key`: The name of the attribute to serialize
- Returns: The serialized value

If a custom serializer method exists (named `_serialize_${key}`), it will be used instead.

### `theId()`

```typescript
theId(): unknown
```

Returns the model's identifier value.

- Returns: The value of the `_idAttribute` property

### `toJSON()`

```typescript
toJSON(): Record<string, any>
```

Converts the model to a plain JavaScript object.

- Returns: An object containing all public attributes

This method excludes methods and properties that start with an underscore.

### `clone()`

```typescript
clone(): BaseModel
```

Creates a deep copy of the model.

- Returns: A new instance of the same class with the same data

## Custom Methods

BaseModel supports a convention-based approach for custom getters, setters, casters, and serializers:

### Custom Getters

```typescript
_get_propertyName(): any
```

Called when accessing a property that doesn't have a standard getter.

### Custom Setters

```typescript
_set_propertyName(value: any): void
```

Called when setting a property that doesn't have a standard setter.

### Custom Casters

```typescript
_cast_propertyName(value: any): any
```

Called when casting a value for a specific property.

### Custom Serializers

```typescript
_serialize_propertyName(): any
```

Called when serializing a specific property.

## Example

```typescript
import { CastingManager, ClassBuilder } from '@encola/hydrator';

// Setup
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Create a model class
const User = builder.newModelClass({
  id: 'number',
  name: 'string',
  email: 'string',
  isActive: 'boolean',
  registeredAt: 'date'
});

// Create an instance
const user = new User({
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  isActive: 'true',
  registeredAt: '2023-01-15'
});

// Access properties
console.log(user.name); // "John Doe"
console.log(user.id); // 123 (number)
console.log(user.isActive); // true (boolean)
console.log(user.registeredAt); // Date object

// Update properties
user.setAttribute('name', 'Jane Doe');
console.log(user.name); // "Jane Doe"

// Convert to JSON
const json = user.toJSON();
console.log(json);
// {
//   id: 123,
//   name: "Jane Doe",
//   email: "john@example.com",
//   isActive: true,
//   registeredAt: "2023-01-15T00:00:00.000Z"
// }

// Clone the model
const clone = user.clone();
clone.setAttribute('name', 'Bob Smith');
console.log(user.name); // "Jane Doe" (unchanged)
console.log(clone.name); // "Bob Smith"
``` 