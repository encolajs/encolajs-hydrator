# Mixins

Mixins are functions that alter the class generated via by the `ClassBuilder`. They receive 2 arguments: the class they have to alter and the options.

Here's the built-in `softdelete` mixin

```typescript
import { PropertySchema } from '../ClassBuilder'

export default function (Class: any, options: any = {}) {
  // specify which of the model's attribute stores the date when the model was deleted
  const deletedAtField: string = options?.deletedAtField || 'deleted_at'

  const props: Record<string, PropertySchema | string> = {}
  props[deletedAtField] = 'date'

  // this adds the deletedAtField as a property of the the class  
  this.applyPropsToClass(Class, props)

  // this adds the `delete()` method to the class to mark the model as deleted
  Class.prototype.delete = function () {
    this[deletedAtField] = new Date()
    if (typeof this.touch === 'function') {
      this.touch()
    }
    return this
  }

  // this adds the `restore()` method to the class which make the model not deleted
  Class.prototype.restore = function () {
    this[deletedAtField] = null
    if (typeof this.touch === 'function') {
      this.touch()
    }
    return this
  }

  // this adds a method to check if a model is deleted or not
  Class.prototype.isDeleted = function () {
    return !!this[deletedAtField]
  }
}

```


## Built-in Mixins

> Note! The built-in mixins are designed to work with classes that extend `BaseModel` and might not work with your own classes.

The `ClassBuilder` comes with several built-in mixins:

### Timestamps Mixin

Adds `created_at` and `updated_at` fields with automatic maintenance:

```javascript
const TimestampedTask = builder
  .withClass(Task)
  .add('props', {
    title: 'string',
    completed: 'boolean'
  })
  .add('timestamps')
  .build();

const task = new TimestampedTask({ title: 'Learn EncolaJS' });
console.log(task.created_at); // Current date/time
console.log(task.updated_at); // Same as created_at

// Later, update the task
task.touch(); // Updates the updated_at timestamp
```

### SoftDelete Mixin

Adds soft deletion capabilities with `deleted_at` tracking:

```javascript
const SoftDeletablePost = builder
  .withClass(Post)
  .add('props', {
    title: 'string',
    content: 'string'
  })
  .add('timestamps')
  .add('softDelete')
  .build();

const post = new SoftDeletablePost({ title: 'Hello World' });

// Soft delete the post
post.delete();
console.log(post.isDeleted()); // true
console.log(post.deleted_at); // Current date/time

// Restore the post
post.restore();
console.log(post.isDeleted()); // false
console.log(post.deleted_at); // null
```

### Methods Mixin

A simple way to add methods to a class:

```javascript
builder
  .withClass(Calculator)
  .add('methods', {
    add(a, b) {
      return a + b;
    },
    subtract(a, b) {
      return a - b;
    }
  })
  .build();
```

This mixin is actually used by the ClassBuilder to add methods to the class

## Custom Mixins

You can easily create and register your own mixins. Here's a mixin to add to a "sluggable" model

```javascript
// Register a custom sluggable mixin
builder.registerMixin('sluggable', function(Class, options = {}) {
  const sourceField = options.sourceField || 'title';
  const targetField = options.targetField || 'slug';
  
  // Add the slug property
  const props = {};
  props[targetField] = 'string';
  this.add('props', props);
  
  // Add generateSlug method
  this.add('methods', {
    generateSlug() {
      const source = this[sourceField] || '';
      this[targetField] = source
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      return this;
    }
  });
  
  // Automatically generate slug when source fields changes
  const originalSetTargetField = Class.prototype[`_set_${targetField}`];
  Class.prototype[`_set_${targetField}`] = function(value) {
    const result = originalSetTargetField.call(this, data);
    if (this[sourceField] && !data[targetField]) {
      this.generateSlug();
    }
    return result;
  };
});
```
Use the mixin
```javascript
const SluggablePost = builder
  .withClass(Post)
  .add('props', {
    title: 'string',
    content: 'string'
  })
  .add('sluggable', { sourceField: 'title' })
  .build();

const post = new SluggablePost({ title: 'Hello World!' });
console.log(post.slug); // "hello-world"
```
