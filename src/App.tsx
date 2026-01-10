import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { PurchaseProvider } from "@/contexts/PurchaseContext";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
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

    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      // Handle OAuth callback
      if (event.url.includes('callback') || event.url.includes('access_token') || event.url.includes('code=')) {
        try {
          // Extract the hash/query parameters
          const url = new URL(event.url);
          const hashParams = new URLSearchParams(url.hash.substring(1));
          const queryParams = new URLSearchParams(url.search);
          
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
          const code = queryParams.get('code');
          
          if (accessToken && refreshToken) {
            // Set session directly with tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) console.error('Error setting session:', error);
          } else if (code) {
            // Exchange code for session
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) console.error('Error exchanging code:', error);
          }
        } catch (error) {
          console.error('Deep link handling error:', error);
        }
      }
    };

    // Listen for app URL open events
    CapApp.addListener('appUrlOpen', handleDeepLink);

    return () => {
      CapApp.removeAllListeners();
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