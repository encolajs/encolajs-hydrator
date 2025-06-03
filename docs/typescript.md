# TypeScript Developer Experience

EncolaJS Hydrator is built with TypeScript and provides excellent type safety when properly configured. This guide shows you how to get the best TypeScript experience with full intellisense and type checking.

### Basic Setup

By default, EncolaJS Hydrator's `CastingManager.cast()` method returns `any`, which means you lose type information. However, there are several ways to improve this.

## Using Type Annotations

The simplest approach is to use TypeScript type annotations:

```typescript
import { BaseModel, BaseCollection, CastingManager, ClassBuilder } from '@encola/hydrator';

// Setup
const castingManager = new CastingManager();
const builder = new ClassBuilder(castingManager);

// Define a User model class
const ProductModel = builder.newModelClass({
  id: 'number',
  name: 'string',
  price: 'decimal:2',
});

// Register the model
castingManager.registerModel('product', ProductModel)

// Use type annotations for full type safety
const product: ProductModel = castingManager.cast(productData, 'product')
const products: BaseCollection<ProductModel> = castingManager.cast(productsData, 'collection:product')

// Now you have full intellisense!
console.log(product.name) // ✅ TypeScript knows this is a string
console.log(products.length) // ✅ TypeScript knows this is a number
products.forEach(p => console.log(p.price)) // ✅ p is typed as ProductModel
```

## Using Generic Method

A cleaner approach is to use the generic `cast` method:

```typescript
/**
 * same as the previous example 
 */

// Use generic method for explicit typing
const product = castingManager.cast<ProductModel>(productData, 'product')
const products = castingManager.cast<BaseCollection<ProductModel>>(productsData, 'collection:product')

// Full type safety and intellisense
console.log(product.name) // ✅ Typed as string
products.filterBy('price', 100) // ✅ Returns BaseCollection<ProductModel>
```

## Key Benefits of TypeScript

1. **Full Intellisense**: Your IDE will provide autocomplete for all properties and methods
2. **Compile-time Error Checking**: TypeScript will catch type mismatches before runtime
3. **Refactoring Safety**: Renaming properties or methods will update all references
4. **Documentation**: Types serve as inline documentation for your API
5. **Team Productivity**: Other developers can easily understand your data structures

### Important Notes

- **Export Your Classes**: You must export your model and collection classes from your modules to use them with TypeScript imports
- **Register Models**: Don't forget to register your models with the CastingManager before using them
- **Type Assertions**: When using collection filtering methods that return BaseCollection, you may need to cast them back to your custom collection type
- **Generic Parameters**: Always specify generic type parameters when using the cast method for best type safety

### Migration from JavaScript

If you're migrating from JavaScript, you can adopt TypeScript gradually:

1. Start with type annotations on your existing code
2. Convert your models to TypeScript classes one by one
3. Add custom collection classes for better DX
4. Use the generic cast method for new code

This approach allows you to get immediate benefits while maintaining compatibility with existing JavaScript code.