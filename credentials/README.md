# Credentials Directory

This directory is for storing credentials needed for EAS builds and submissions.

## Android

For Android, you'll need to place your Keystore file and/or Google Play service account key in this directory.

- **Keystore file**: `android/app-keystore.jks` (for signing your app)
- **Google Play service account key**: `android/service-account-key.json` (for submissions to Google Play)

## iOS

For iOS, you don't need to store any files here as Apple credentials are managed through your Apple Developer account.

## Usage

These credentials are referenced in your `eas.json` configuration. Do not commit these files to your repository.
