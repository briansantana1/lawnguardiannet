import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;