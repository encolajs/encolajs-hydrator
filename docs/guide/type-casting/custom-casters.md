# Custom Casters

While EncolaJS Hydrator includes many built-in casters, you may need to create custom casters for specific data types in your application. Custom casters allow you to define how values are converted to and from your domain-specific types.

## Registering a Custom Caster

To create a custom caster, use the `register` method on the `CastingManager`:

```javascript
castingManager.register(
  'typeName',     // The name of your custom type
  castFunction,   // Function to convert values to your type
  serializeFunction  // (Optional) Function to convert your type back to basic JS
);
```

## Basic Example

Let's create a custom caster for email addresses that validates and normalizes them:

```javascript
// Register an email caster
castingManager.register('email', function(value) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }
  
  // Convert to string and clean up
  const strValue = String(value).trim().toLowerCase();
  
  // Basic validation (you might want more robust validation)
  if (!/\S+@\S+\.\S+/.test(strValue)) {
    return ''; // Return empty string for invalid emails
  }
  
  return strValue;
});

// Use the custom caster
const email1 = castingManager.cast('  USER@EXAMPLE.COM  ', 'email'); 
// "user@example.com"

const email2 = castingManager.cast('invalid-email', 'email');
// "" (empty string)
```

## Adding Serialization

Custom casters can also include serialization functions to convert values back to simpler formats:

```javascript
// A caster for coordinate objects
castingManager.register(
  'coordinate',
  // Cast function - converts from various formats to a coordinate object
  function(value) {
    if (value === null || value === undefined) {
      return null;
    }
    
    // Handle string format like "40.7128,-74.0060"
    if (typeof value === 'string') {
      const parts = value.split(',').map(part => parseFloat(part.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { lat: parts[0], lng: parts[1] };
      }
    }
    
    // Handle object format
    if (typeof value === 'object') {
      const lat = this.cast(value.lat || value.latitude, 'number');
      const lng = this.cast(value.lng || value.longitude, 'number');
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    return null;
  },
  
  // Serialize function - converts coordinate object to string
  function(value) {
    if (value && typeof value === 'object' && 'lat' in value && 'lng' in value) {
      return `${value.lat},${value.lng}`;
    }
    return null;
  }
);

// Use the coordinate caster
const coord1 = castingManager.cast('40.7128,-74.0060', 'coordinate');
// { lat: 40.7128, lng: -74.0060 }

const coord2 = castingManager.cast({ latitude: '40.7128', longitude: '-74.0060' }, 'coordinate');
// { lat: 40.7128, lng: -74.0060 }

// Serialize back to string
const serialized = castingManager.serialize(coord1, 'coordinate');
// "40.7128,-74.0060"
```

## Best Practices

1. **Always handle null/undefined**: Return `null` for null input values.
2. **Handle various input formats**: Try to accommodate different input formats when practical.
3. **Validate thoroughly**: Include validation logic to ensure the resulting data is valid.
4. **Keep casters pure**: Avoid side effects in casting functions.
5. **Document the expected formats**: Make it clear what formats your caster accepts and produces.

For more details on the API, see the [CastingManager API Reference](../../api/casting-manager.md). 