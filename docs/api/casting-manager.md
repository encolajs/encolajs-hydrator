# CastingManager API Reference

## Constructor

```javascript
const castingManager = new CastingManager();
```

Creates a new casting manager with built-in casters.

## Methods

### `register(type, castFn, serializeFn?)`

Registers a new caster function for the specified type.

- `type` (string): The name of the type
- `castFn` (function): Function that converts values to the specified type
- `serializeFn` (function, optional): Function that serializes values of this type

### `registerModel(type, ModelClass, CollectionClass?)`

Registers a model class for casting and (optionally) a collection class. More on this in the [BaseModel](../models/base-model.md) and [BaseCollection](../collections/base-collection.md) documentation.

- `type` (string): The type name
- `ModelClass` (class): The model class (typically extends BaseModel)
- `CollectionClass` (class, optional): Collection class for arrays of this model

### `cast(value, typeSpec)`

Casts a value to the specified type.

- `value` (any): The value to cast
- `typeSpec` (string): Type specification (e.g., 'number', 'decimal:2', 'array:string')

### `serialize(value, typeSpec)`

Serializes a complex value back to a simpler representation.

- `value` (any): The value to serialize
- `typeSpec` (string): Type specification 