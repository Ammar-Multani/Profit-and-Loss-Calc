# APK Size Optimization

This document explains the optimizations applied to reduce the APK size from 65.6MB.

## Optimizations Implemented

1. **Enabled Proguard and Shrink Resources**

   - Modified `android/app/build.gradle` to enable code minification and resource shrinking
   - Enhanced Proguard rules in `android/app/proguard-rules.pro`

2. **Configured Android App Bundle**

   - Updated `eas.json` to use App Bundle instead of APK
   - Enabled split APKs by architecture to generate smaller, device-specific installations

3. **Optimized Asset Bundling**

   - Updated `app.json` to include only necessary assets
   - Added pattern matching to exclude unused assets

4. **Removed Duplicate Dependencies**

   - Removed redundant chart libraries to reduce bundle size

5. **Optimized Metro Configuration**

   - Enhanced JavaScript bundling configuration for better minification

6. **Added WebP Support**
   - Enabled WebP image format support for better compression
   - Created script to convert PNG images to WebP

## Additional Optimization Steps

1. **Run the Image Optimization Script**

   ```
   npm run optimize-images
   ```

   This converts PNG images to WebP format for better compression.

2. **Check for Unused Dependencies**
   Review your code and remove any unused imports or components.

3. **Use Dynamic Imports**
   For large components that aren't needed immediately, consider using dynamic imports:

   ```javascript
   const HeavyComponent = React.lazy(() => import("./HeavyComponent"));
   ```

4. **Analyze Bundle Size**
   Use tools like `react-native-bundle-visualizer` to identify large packages:

   ```
   npx react-native-bundle-visualizer
   ```

5. **Test in Production Mode**
   Always test the production build to ensure optimizations don't break functionality:
   ```
   npm run build:production
   ```

## Results

After applying these optimizations, the APK size should be significantly reduced from the original 65.6MB. The exact reduction will depend on your specific app content and assets.

## Additional Resources

- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Android App Bundle Documentation](https://developer.android.com/guide/app-bundle)
- [WebP Format Documentation](https://developers.google.com/speed/webp)
