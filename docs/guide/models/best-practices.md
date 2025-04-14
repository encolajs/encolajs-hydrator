# Edge Cases and Best Practices for Models

## Handling Nullable Values

The BaseModel initializes undefined attributes with `null` on access:

```javascript
const user = new User();
console.log(user.name); // null (not undefined)
```

This makes property access more predictable and prevents `undefined` errors. It is a deliberate design choice to handle nested relations of objects and collections.

For example, calling `order.items.add({})` on an empty Order model will ensure that `order.items` is a collection and calling `add()` on it won't generate an error.

## Circular References

When dealing with models that reference each other, be careful with serialization:

```javascript
// Potential circular reference problem
const user = new User({ name: 'John' });
const task = new Task({ title: 'Test', assignedTo: user });

// If we add a task reference back to the user
user._data.currentTask = task;

// This could cause a stack overflow during serialization
// To fix, add a custom serializer:
User.prototype._serialize_currentTask = function() {
  // Return just the ID or simplified representation
  return this._data.currentTask ? { id: this._data.currentTask.theId() } : null;
};
```

## Performance Considerations

For applications with many model instances:

1. **Minimize deep cloning**: Use references when appropriate
2. **Batch updates**: Use `setAttributes()` instead of multiple individual property assignments
3. **Avoid unnecessary getters/setters**: For internal properties, under certain conditions you may access `_data` directly in methods
4. **Consider using `any` instead of `string` as a type**: This will omit the casting and serialization logic. Strings should be used only if you want to do string manipulation.
5. **Consider lazy loading**: For complex nested structures, load data on demand

## Computed Properties

```javascript
class Invoice extends BaseModel {
  // ... getters and setters for items, taxRate, etc ...
  
  get subtotal() {
    return (this._data.items || []).reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
  }
  
  get taxAmount() {
    return this.subtotal * (this._data.taxRate || 0) / 100;
  }
  
  get total() {
    return this.subtotal + this.taxAmount;
  }
}
```
