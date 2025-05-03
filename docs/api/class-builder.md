## API Reference

### Constructor

```javascript
const builder = new ClassBuilder(castingManager);
```

Creates a new class builder with the provided casting manager.

### Methods

#### `withClass(Class)`

Sets the class to enhance.

- `Class`: The class to enhance

#### `add(mixinName, options)`

Adds a mixin to the current class.

- `mixinName`: Name of the mixin ('props', 'methods', 'timestamps', etc.)
- `options`: Options for the mixin

#### `build()`

Finalizes and returns the enhanced class.

#### `registerMixin(name, fn)`

Registers a custom mixin.

- `name`: Name of the mixin
- `fn`: Mixin implementation function

#### `newModelClass(props, mixins, methods)`

Creates a new model class extending [BaseModel](/models/base-model.md).

- `props`: Property definitions
- `mixins`: Mixin configurations
- `methods`: Method definitions

#### `newCollectionClass(ModelClass, mixins, methods)`

Creates a new collection class for the specified model and extends [BaseCollection](/collections/base-collection.md).

- `ModelClass`: The model class
- `mixins`: Mixin configurations
- `methods`: Method definitions

