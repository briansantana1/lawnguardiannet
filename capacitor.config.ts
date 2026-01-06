import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor Configuration for Lawn Guardian
 * 
 * Production settings for Apple App Store and Google Play Store deployment.
 * 
 * IMPORTANT: Before building for production:
 * 1. Update appId to your actual bundle ID registered with Apple/Google
 * 2. Remove or update the server.url for production builds
 * 3. Ensure all signing certificates are properly configured
 */

const config: CapacitorConfig = {
  // App identifier - must match App Store Connect and Google Play Console
  appId: 'com.lawnguardian.app',
  
  // Display name shown on device
  appName: 'Lawn Guardian™',
  
  // Build output directory
  webDir: 'dist',
  
  // Server configuration
  // For production: Remove server block entirely to use bundled assets
  // For development: Use this to connect to dev server
  server: process.env.NODE_ENV === 'development' ? {
    url: 'http://localhost:5173',
    cleartext: true,
  } : {
    // Production: Use bundled web assets
    androidScheme: 'https',
  },
  
  // iOS-specific configuration
  ios: {
    // Content inset behavior for safe areas
    contentInset: 'automatic',
    
    // Allow mixed content (required for some WebViews)
    allowsLinkPreview: true,
    
    // Scroll behavior
    scrollEnabled: true,
    
    // Preferences
    preferredContentMode: 'mobile',
    
    // Scheme for custom URL handling
    scheme: 'lawnguardian',
    
    // Background modes handled in Info.plist
  },
  
  // Android-specific configuration
  android: {
    // Allow mixed content
    allowMixedContent: false,
    
    // Capture input from keyboard
    captureInput: true,
    
    // Use Android's WebView
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
    
    // Build flavor
    flavor: 'production',
    
    // Minimum SDK version
    minSdkVersion: 24,
    
    // Override user agent (optional)
    // overrideUserAgent: 'LawnGuardian/1.0',
  },
  
  // Plugins configuration
  plugins: {
    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    
    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#4CAF50',
      sound: 'beep.wav',
    },
    
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F0FDF4',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    // Status Bar
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F0FDF4',
    },
    
    // Keyboard
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    
    // HTTP (for API calls)
    CapacitorHttp: {
      enabled: true,
    },
    
    // In-App Purchases (StoreKit / Google Play Billing)
    // Configure in platform-specific files
  },
  
  // Logging
  loggingBehavior: process.env.NODE_ENV === 'development' ? 'debug' : 'production',
  
  // Deep linking configuration
  // Deep links are configured in iOS Info.plist and Android AndroidManifest.xml
};

export default config;
