# Built-in Casters

EncolaJS Hydrator comes with a set of built-in casters for common data types that handle most basic conversion scenarios.

## Basic Types

### Boolean

Converts various truthy/falsy value representations to boolean.

```javascript
castingManager.cast("true", "boolean"); // true
castingManager.cast("yes", "boolean");  // true
castingManager.cast("1", "boolean");    // true
castingManager.cast(1, "boolean");      // true

castingManager.cast("false", "boolean"); // false
castingManager.cast("no", "boolean");    // false
castingManager.cast("0", "boolean");     // false
castingManager.cast(0, "boolean");       // false
```

### Number

Converts string representations of numbers to actual JavaScript numbers.

```javascript
castingManager.cast("123", "number");     // 123
castingManager.cast("123.45", "number");  // 123.45
castingManager.cast("-123", "number");    // -123
castingManager.cast(true, "number");      // 1
castingManager.cast(false, "number");     // 0
```

### Decimal

Numbers with a specified precision.

```javascript
castingManager.cast("123.456", "decimal:2");  // 123.46
castingManager.cast("123.456", "decimal:0");  // 123
castingManager.cast(123.456, "decimal:1");    // 123.5
```

### String

Converts values to strings.

```javascript
castingManager.cast(123, "string");        // "123"
castingManager.cast(true, "string");       // "true"
castingManager.cast([1,2,3], "string");    // "1,2,3"
```

## Date Types

### Date

Converts various date formats to JavaScript Date objects.

```javascript
castingManager.cast("2023-01-15", "date");      // Date object (2023-01-15)
castingManager.cast(1673740800000, "date");     // Date object from timestamp
castingManager.cast("01/15/2023", "date");      // Date object (2023-01-15)
```

### DateTime

Similar to Date, but preserves time information.

```javascript
castingManager.cast("2023-01-15T14:30:00", "datetime");  // Date with time
```

## Array Types

### Array

Ensures a value is an array, or wraps it in an array if it's not.

```javascript
castingManager.cast("test", "array");           // ["test"]
castingManager.cast(123, "array");              // [123]
castingManager.cast([1, 2, 3], "array");        // [1, 2, 3] (unchanged)
```

### Typed Arrays

Converts each element in an array to a specified type.

```javascript
castingManager.cast(["1", "2", "3"], "array:number");       // [1, 2, 3]
castingManager.cast(["true", "false"], "array:boolean");    // [true, false]
castingManager.cast([1234567890, 987654321], "array:date"); // [Date, Date]
```

For complete details on all built-in casters, see the [API Reference](../../api/casting-manager.md). 