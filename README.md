# EncolaJS Hydrator

A lightweight, flexible TypeScript library for schema-based object hydration with forgiving type casting and behavior composition.

[![npm version](https://img.shields.io/npm/v/encolajs-hydrator.svg)](https://www.npmjs.org/package/encolajs-hydrator)
[![install size](https://packagephobia.now.sh/badge?p=encolajs-hydrator)](https://packagephobia.now.sh/result?p=encolajs-hydrator)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

EncolaJS Hydrator provides two main components that can be used together or independently:
- **CastingManager**: A flexible type conversion/serialization system
- **ClassBuilder**: A set of tools for enhancing JavaScript classes with typed properties and behaviors

## Installation

```bash
npm install @encolajs/hydrator
```

## CastingManager

The CastingManager provides a robust type conversion system that transforms values into specific data types at runtime. It handles both casting (converting input values to a specific type) and serialization (formatting output values). The CastingManager can be used independently when you only need type conversion without the full object hydration functionality.

### Built-in Types

CastingManager comes with several built-in types:

- `string` - Converts values to strings
- `number` - Converts values to numbers
- `decimal` - Converts values to numbers with fixed decimal places (e.g., `decimal:2`)
- `boolean` - Converts values to booleans
- `date` - Converts values to Date objects and serializes to YYYY-MM-DD
- `datetime` - Converts values to Date objects and serializes to ISO strings
- `array` - Handles arrays of values, with nested type support (e.g., `array:string`)

### Basic Usage

```typescript
import { CastingManager } from '@encolajs/hydrator';

// Create a casting manager
const castingManager = new CastingManager();

// Use built-in types
const numValue = castingManager.cast('123', 'number'); // 123 (as number)
const dateValue = castingManager.cast('2023-05-15', 'date'); // Date object
const boolValue = castingManager.cast(1, 'boolean'); // true
const arrayOfNums = castingManager.cast(['1', '2', '3'], 'array:number'); // [1, 2, 3]

// Serialize values
const serializedDate = castingManager.serialize(new Date('2023-05-15'), 'date'); // "2023-05-15"
```

### Custom Type Registration

You can easily register your own custom types:

```typescript
// Register a custom money type
castingManager.register(
  'money',
  // Cast function
  function(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[$,€£¥]/g, '');
      return parseFloat(cleaned);
    }
    return 0;
  },
  // Serialize function (optional)
  function(value) {
    return `$${value.toFixed(2)}`;
  }
);

// Use the custom type
const price = castingManager.cast('$1,299.99', 'money'); // 1299.99
const formattedPrice = castingManager.serialize(1299.99, 'money'); // "$1299.99"
```

### Type Parameters

Some types support parameters for customization:

```typescript
// Decimal with 2 decimal places
const amount = castingManager.cast('123.456', 'decimal:2'); // 123.46

// Decimal with 3 decimal places
const precise = castingManager.cast('123.456', 'decimal:3'); // 123.456

// Array of strings
const tags = castingManager.cast(['coding', 1, true], 'array:string'); // ["coding", "1", "true"]
```

## ClassBuilder

The ClassBuilder provides a set of tools to allow creating specific classes. It can be used to create rich domain models with automatic type casting and serialization. 

It has built-in support for typed properties and can easily be extended using mixins

### Adding Properties to Classes

```typescript
import { CastingManager, ClassBuilder } from '@encolajs/hydrator';

const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Define a Person class
function Person(data = {}) {
  Object.entries(data).forEach(([key, value]) => {
    if (key in this) {
      this[key] = value;
    }
  });
}

// Add typed properties to Person
builder.addProps(Person, {
  name: 'string',
  age: 'number',
  birthdate: 'date',
  active: 'boolean'
});

// Create a Person instance with automatic type casting
const person = new Person({
  name: 'John Doe',
  age: '30', // person.age === 30
  birthdate: '1993-05-15', // person.birthdate instanceof Date
  active: 1 // person.active === true
});

const json = JSON.stringify(person);
console.log( JSON.stringify(person)); // '{"name":"John Doe","age":30,"birthdate":"1993-05-15","active":true}'
```

### Computed Properties

You can define properties with custom getters and setters:

```typescript
builder.addProps(Person, {
  firstName: 'string',
  lastName: 'string',
  // Computed property
  fullName: {
    type: 'string',
    get: function(instance) {
      return `${instance.firstName} ${instance.lastName}`;
    },
    set: function(instance, value) {
      const parts = value.split(' ');
      instance.firstName = parts[0] || '';
      instance.lastName = parts.slice(1).join(' ') || '';
    }
  }
});

const person = new Person({
  firstName: 'John',
  lastName: 'Doe'
});

console.log(person.fullName); // "John Doe"

person.fullName = 'Jane Smith';
console.log(person.firstName); // "Jane"
console.log(person.lastName); // "Smith"
```

### Working with Mixins

Mixins allow you to add reusable behaviors to your classes:

```typescript
// Define a timestamps mixin
builder.mixin('timestamps', function(Class) {
  this.addProps(Class, {
    created_at: 'date',
    updated_at: 'date'
  });
  
  Class.prototype.touch = function() {
    this.updated_at = new Date();
    return this;
  };
});

// Define a softDelete mixin
builder.mixin('softDelete', function(Class) {
  this.addProps(Class, {
    deleted_at: 'date'
  });
  
  Class.prototype.delete = function() {
    this.deleted_at = new Date();
    return this;
  };
  
  Class.prototype.restore = function() {
    this.deleted_at = null;
    return this;
  };
  
  Class.prototype.isDeleted = function() {
    return !!this.deleted_at;
  };
});

// Apply mixins to a class
builder.apply(Person, 'timestamps');
builder.apply(Person, 'softDelete');

// Use mixin methods
const person = new Person({ name: 'John Doe' });
person.touch(); // Sets updated_at to current date
person.delete(); // Sets deleted_at to current date
console.log(person.isDeleted()); // true
```

### Passing Parameters to Mixins

You can pass additional configuration to mixins:

```typescript
// Define a configurable mixin
builder.mixin('validation', function(Class, options = {}) {
  const { required = [] } = options;
  
  Class.prototype.validate = function() {
    const errors = [];
    
    for (const field of required) {
      if (!this[field]) {
        errors.push(`${field} is required`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
});

// Apply with configuration
builder.apply(Person, 'validation', { required: ['name', 'email'] });

// Validate an instance
const person = new Person({ name: 'John' });
console.log(person.validate()); 
// { isValid: false, errors: ['email is required'] }
```

## Complete Example: Blog System

Here's a more complex example showing how to model a blog system with posts, comments, and users:

```typescript
import { CastingManager, ClassBuilder } from '@encolajs/hydrator';

// Set up the hydration system
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Define base constructors for our domain models
function User(data = {}) {
  Object.entries(data).forEach(([key, value]) => {
    if (key in this) this[key] = value;
  });
}

function Post(data = {}) {
  Object.entries(data).forEach(([key, value]) => {
    if (key in this) this[key] = value;
  });
}

function Comment(data = {}) {
  Object.entries(data).forEach(([key, value]) => {
    if (key in this) this[key] = value;
  });
}

// Define common mixins
builder.mixin('timestamps', function(Class) {
  this.addProps(Class, {
    created_at: 'date',
    updated_at: 'date'
  });
  
  Class.prototype.touch = function() {
    this.updated_at = new Date();
    return this;
  };
});

builder.mixin('softDelete', function(Class) {
  this.addProps(Class, {
    deleted_at: 'date'
  });
  
  Class.prototype.delete = function() {
    this.deleted_at = new Date();
    return this;
  };
  
  Class.prototype.restore = function() {
    this.deleted_at = null;
    return this;
  };
  
  Class.prototype.isDeleted = function() {
    return !!this.deleted_at;
  };
});

// Set up User class
builder.addProps(User, {
  id: 'number',
  name: 'string',
  email: 'string',
  role: 'string'
});

builder.apply(User, 'timestamps');
builder.apply(User, 'softDelete');

// Add User methods
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.canEdit = function(post) {
  return this.isAdmin() || post.author_id === this.id;
};

// Register User with casting manager for use in other models
castingManager.register(
  'User',
  function(value) {
    if (value instanceof User) return value;
    return new User(value);
  },
  function(value) {
    if (!(value instanceof User)) {
      value = this.cast(value, 'User');
    }
    return value.toJSON();
  }
);

// Set up Post class
builder.addProps(Post, {
  id: 'number',
  title: 'string',
  content: 'string',
  author_id: 'number',
  author: 'User',
  published: 'boolean',
  published_at: 'date',
  tags: 'array:string',
  comments: 'array:Comment',
  // Computed property example
  excerpt: {
    type: 'string',
    get: function(instance) {
      const content = instance.content || '';
      return content.length > 100 
        ? content.substring(0, 100) + '...' 
        : content;
    }
  }
});

builder.apply(Post, 'timestamps');
builder.apply(Post, 'softDelete');

// Add Post methods
Post.prototype.publish = function() {
  this.published = true;
  this.published_at = new Date();
  return this;
};

Post.prototype.unpublish = function() {
  this.published = false;
  this.published_at = null;
  return this;
};

// Set up Comment class
builder.addProps(Comment, {
  id: 'number',
  post_id: 'number',
  author_id: 'number',
  author: 'User',
  content: 'string',
  approved: 'boolean'
});

builder.apply(Comment, 'timestamps');
builder.apply(Comment, 'softDelete');

// Add Comment methods
Comment.prototype.approve = function() {
  this.approved = true;
  return this;
};

Comment.prototype.reject = function() {
  this.approved = false;
  return this;
};

// Sample data from an API
const apiData = {
  post: {
    id: 1,
    title: "Getting Started with Schema Hydrator",
    content: "This is a comprehensive guide to using the Schema Hydrator library...",
    author_id: 1,
    author: {
      id: 1,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      created_at: "2023-01-10T12:00:00Z"
    },
    published: true,
    published_at: "2023-05-20T08:15:00Z",
    tags: ["typescript", "hydration", "tutorial"],
    created_at: "2023-05-15T14:30:00Z",
    updated_at: "2023-05-20T08:15:00Z"
  },
  comments: [
    {
      id: 101,
      post_id: 1,
      author_id: 2,
      author: {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        role: "user"
      },
      content: "Great article!",
      approved: true,
      created_at: "2023-05-21T10:45:00Z"
    }
  ]
};

// Hydrate the data into our domain models
const post = new Post(apiData.post);

// Now we can use the rich domain models
console.log(post.title);
console.log(post.excerpt); 
console.log(post.author instanceof User); // true
console.log(post.author.isAdmin()); // true

// Mark a comment as deleted
comments[0].delete();
console.log(comments[0].isDeleted()); // true
```
