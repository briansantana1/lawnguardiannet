import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Preferences } from "@capacitor/preferences";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfUse } from "./pages/TermsOfUse";
import { Contact } from "./pages/Contact";
import { Legal } from "./pages/Legal";
import { Profile } from "./pages/Profile";
import { Plans } from "./pages/Plans";
import { SavedPlans } from "./pages/SavedPlans";
import { CancelMembership } from "./pages/CancelMembership";
import { RestoreMembership } from "./pages/RestoreMembership";
import { Purchase } from "./pages/Purchase";
import { DeleteAccount } from "./pages/DeleteAccount";
import Landing from "./pages/Landing";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";

const queryClient = new QueryClient();

// Deep link handler for OAuth callbacks on mobile
function DeepLinkHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleOAuthUrl = async (url: string) => {
      console.log('Processing OAuth URL:', url);
      
      // Close the browser window
      try {
        await Browser.close();
      } catch (e) {
        // Browser might already be closed
      }
      
      // Handle OAuth callback
      if (url.includes('callback') || url.includes('access_token') || url.includes('code=') || url.includes('error=')) {
        try {
          // Parse the URL - handle custom scheme
          let hashString = '';
          let searchString = '';
          
          // Extract hash and query parts manually for custom schemes
          const hashIndex = url.indexOf('#');
          const queryIndex = url.indexOf('?');
          
          if (hashIndex !== -1) {
            hashString = url.substring(hashIndex + 1);
          }
          if (queryIndex !== -1) {
            const endIndex = hashIndex !== -1 && hashIndex > queryIndex ? hashIndex : url.length;
            searchString = url.substring(queryIndex + 1, endIndex);
          }
          
          const hashParams = new URLSearchParams(hashString);
          const queryParams = new URLSearchParams(searchString);
          
          // Check for errors first
          const error = hashParams.get('error') || queryParams.get('error');
          const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
          if (error) {
            console.error('OAuth error:', error, errorDescription);
            return;
          }
          
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
          const code = queryParams.get('code');
          
          console.log('OAuth params - accessToken:', !!accessToken, 'refreshToken:', !!refreshToken, 'code:', !!code);
          console.log('Full URL for debugging:', url);
          
          if (accessToken && refreshToken) {
            // Set session directly with tokens (implicit flow)
            console.log('Setting session with tokens...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              console.error('Error setting session:', error);
            } else {
              console.log('Session set successfully:', !!data.session);
            }
          } else if (code) {
            // Exchange code for session (PKCE flow)
            console.log('Exchanging code for session...');
            
            // First, restore any backed up keys from native Preferences storage
            // This is critical - the verifier might have been lost when app was backgrounded
            try {
              const keysToRestore = [
                'sb-zxkugpfmwieexgldnlyl-auth-token-code-verifier',
                'supabase.auth.token-code-verifier'
              ];
              
              for (const originalKey of keysToRestore) {
                const backupKey = `backup_${originalKey}`;
                const { value } = await Preferences.get({ key: backupKey });
                if (value && !localStorage.getItem(originalKey)) {
                  localStorage.setItem(originalKey, value);
                  console.log('Restored from native storage:', originalKey);
                }
              }
              
              // Also restore any other sb- keys
              // We can't enumerate Preferences, so restore what we know might exist
              const allPossibleKeys = Object.keys(localStorage).filter(k => k.startsWith('backup_'));
              for (const backupKey of allPossibleKeys) {
                const originalKey = backupKey.replace('backup_', '');
                const value = localStorage.getItem(backupKey);
                if (value && !localStorage.getItem(originalKey)) {
                  localStorage.setItem(originalKey, value);
                  console.log('Restored verifier from localStorage backup:', originalKey);
                }
              }
            } catch (e) {
              console.log('Error restoring from Preferences:', e);
            }
            
            let { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Error exchanging code:', error.message);
              
              // Try one more time after a brief delay
              await new Promise(resolve => setTimeout(resolve, 500));
              const retry = await supabase.auth.exchangeCodeForSession(code);
              if (retry.error) {
                console.error('Retry also failed:', retry.error.message);
                // Check if session was set anyway
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData?.session) {
                  console.log('Found existing session despite exchange error');
                }
              } else {
                console.log('Retry succeeded:', !!retry.data.session);
              }
            } else {
              console.log('Code exchanged successfully:', !!data.session);
            }
            
            // Clean up backup keys from native storage
            try {
              const keysToClean = [
                'backup_sb-zxkugpfmwieexgldnlyl-auth-token-code-verifier',
                'backup_supabase.auth.token-code-verifier'
              ];
              for (const key of keysToClean) {
                await Preferences.remove({ key });
              }
            } catch (e) {
              // Ignore cleanup errors
            }
          } else {
            console.log('No tokens or code found in callback URL');
            // Check if session was already set by Supabase
            const { data: sessionData } = await supabase.auth.getSession();
            console.log('Checking for existing session:', !!sessionData?.session);
          }
        } catch (error) {
          console.error('Deep link handling error:', error);
        }
      }
    };

    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received via appUrlOpen:', event.url);
      await handleOAuthUrl(event.url);
    };

    // Listen for app URL open events (when app is in background)
    CapApp.addListener('appUrlOpen', handleDeepLink);
    
    // Also check for launch URL (when app is cold started via deep link)
    CapApp.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log('App launched with URL:', result.url);
        handleOAuthUrl(result.url);
      }
    });

    // Listen for app resume to check session
    CapApp.addListener('resume', async () => {
      console.log('App resumed, checking session...');
      // Small delay to allow any pending auth to complete
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check on resume:', !!session);
      }, 500);
    });

    // Listen for browser finished event
    Browser.addListener('browserFinished', async () => {
      console.log('Browser finished, checking session...');
      // Small delay to allow the deep link to be processed first
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check after browser closed:', !!session);
      }, 1000);
    });

    return () => {
      CapApp.removeAllListeners();
      Browser.removeAllListeners();
    };
  }, []);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PurchaseProvider>
      <DeepLinkHandler />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/saved-plans" element={<SavedPlans />} />
            <Route path="/cancel-membership" element={<CancelMembership />} />
            <Route path="/restore-membership" element={<RestoreMembership />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </PurchaseProvider>
  </QueryClientProvider>
);

export default App;