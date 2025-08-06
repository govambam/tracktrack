# GrowthBook Feature Flags Integration

This project includes GrowthBook for feature flag management and A/B testing.

## Setup

1. **SDK Installation**: ✅ Already installed
   ```bash
   npm install @growthbook/growthbook-react
   ```

2. **Configuration**: ✅ Already configured
   - Client Key: `sdk-w1E948s82nX7yJ5u`
   - Secret Key: `secret_user_btmV7USvLUv7ZqSYYy4IqTLbhzbIIKGgFJYGgkRPX4U`
   - API Host: `https://cdn.growthbook.io`

3. **Admin Interface**: ✅ Available at `/admin`
   - Create/update/delete feature flags
   - Enable/disable flags in real-time
   - Live preview of changes

## Usage

### Basic Hooks

```typescript
import { useFeatureEnabled, useFeatureFlag } from '@/contexts/GrowthBookContext';

// Boolean feature flag
const isEnabled = useFeatureEnabled('my-feature');

// Feature flag with any value type
const buttonColor = useFeatureFlag('button-color', 'default');
const maxUsers = useFeatureFlag('max-users', 100);
```

### Typed Hooks (Recommended)

```typescript
import { useNewUIDesign, useButtonColor } from '@/hooks/useFeatureFlags';

// Type-safe feature flag usage
const isNewUIEnabled = useNewUIDesign();
const buttonColor = useButtonColor();
```

### Adding New Feature Flags

1. **Add to TypeScript types** in `client/hooks/useFeatureFlags.ts`:
   ```typescript
   export type FeatureFlagKey = 
     | 'existing-flag'
     | 'my-new-flag'; // Add your new flag here
   ```

2. **Create a typed hook** (optional but recommended):
   ```typescript
   export const useMyNewFeature = () => useFeatureEnabled('my-new-flag');
   ```

3. **Use in components**:
   ```typescript
   import { useMyNewFeature } from '@/hooks/useFeatureFlags';

   const MyComponent = () => {
     const isEnabled = useMyNewFeature();
     
     return (
       <div>
         {isEnabled && <NewFeatureComponent />}
       </div>
     );
   };
   ```

## Feature Flag Examples

### Boolean Flags
```typescript
const showBetaFeatures = useFeatureEnabled('beta-features');

return (
  <div>
    {showBetaFeatures && <BetaFeature />}
  </div>
);
```

### String/Number Flags
```typescript
const theme = useFeatureFlag('ui-theme', 'light');
const maxItems = useFeatureFlag('max-items', 10);

return (
  <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
    {items.slice(0, maxItems).map(item => <Item key={item.id} {...item} />)}
  </div>
);
```

### Conditional Styling
```typescript
const buttonVariant = useFeatureFlag('button-style', 'default');

return (
  <Button 
    className={
      buttonVariant === 'colorful' ? 'bg-purple-600' :
      buttonVariant === 'minimal' ? 'bg-gray-600' :
      'bg-blue-600'
    }
  >
    Click me
  </Button>
);
```

## Managing Flags

1. **GrowthBook Dashboard**: Use your GrowthBook dashboard to:
   - Create new feature flags
   - Set targeting rules
   - Run A/B tests
   - Monitor flag usage

2. **Environment Variables**:
   ```env
   VITE_GROWTHBOOK_CLIENT_KEY=sdk-w1E948s82nX7yJ5u
   VITE_GROWTHBOOK_API_HOST=https://cdn.growthbook.io
   ```

## Demo

Visit the homepage (`/`) to see the GrowthBook Feature Flags Demo section, which demonstrates:
- Boolean feature flags
- String/number feature flags
- Conditional rendering
- Dynamic styling

## Best Practices

1. **Use TypeScript types** for all feature flags
2. **Provide sensible fallbacks** for all flags
3. **Clean up unused flags** regularly
4. **Use descriptive flag names** (e.g., `new-checkout-flow` not `flag1`)
5. **Test both enabled and disabled states** of features
6. **Monitor performance impact** of feature flag checks

## Troubleshooting

- **Flags not loading**: Check network connectivity and API key
- **TypeScript errors**: Ensure flag keys are added to `FeatureFlagKey` type
- **Performance issues**: Consider caching for frequently checked flags
