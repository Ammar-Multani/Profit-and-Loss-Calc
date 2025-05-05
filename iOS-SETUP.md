# iOS Build Setup Guide

This guide explains how to set up and build the P&L Calc app for iOS.

## Prerequisites

1. **Apple Developer Account**: You need an Apple Developer account ($99/year).
2. **Xcode**: Make sure you have the latest version of Xcode installed on a Mac.
3. **Node.js**: Ensure you have Node.js v18+ installed.
4. **EAS CLI**: Install the EAS CLI: `npm install -g eas-cli`
5. **Expo**: Ensure you have the latest Expo SDK.

## Setup Steps

### 1. Configure Apple Developer Account

1. Log in to your [Apple Developer Account](https://developer.apple.com/).
2. Go to Certificates, Identifiers & Profiles.
3. Note your Team ID (found under Membership).
4. Create an App ID if you don't have one already. Use the bundle identifier: `com.enacton.profitlosscalc`.

### 2. Configure App Store Connect

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/).
2. Go to "My Apps" and create a new app if needed.
3. Note the App Store Connect App ID (ASC App ID).

### 3. Update EAS Configuration

1. Open `eas.json` and update the submit section with your credentials:
   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "ascAppId": "your-asc-app-id",
         "appleTeamId": "your-team-id"
       }
     }
   }
   ```

### 4. Building for iOS

#### Development Build (for Testing on Simulator)

```bash
yarn build:ios:simulator
```

This will create a build for iOS simulator that you can install and test.

#### Internal Distribution (for TestFlight Testing)

```bash
yarn build:ios:preview
```

This will create a build that you can upload to TestFlight for internal testing.

#### Production Build

```bash
yarn build:ios:production
```

This will create a production build that you can submit to the App Store.

### 5. Submitting to App Store

Once you have a production build, you can submit it to the App Store:

```bash
yarn submit:ios
```

If you're using two-factor authentication, you'll be prompted for an app-specific password. See the [credentials/ios/README.md](credentials/ios/README.md) for instructions on generating this password.

## Troubleshooting

### Common Issues

1. **Certificate or Profile Issues**: EAS will attempt to create and manage these automatically. If you encounter issues, try:

   ```
   eas credentials clear --platform ios
   ```

2. **Build fails with code signing error**: Ensure your Apple Developer account has the correct capabilities enabled for your App ID.

3. **Cannot find matching provisioning profiles**: This usually means you need to accept the latest Apple Developer Agreement. Log in to your Apple Developer account to check.

### Getting Help

If you encounter any other issues, check the [Expo documentation](https://docs.expo.dev/build/introduction/) or open an issue in the project repository.
