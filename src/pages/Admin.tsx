/**
 * Admin Login Page
 * 
 * Provides admin authentication that redirects to the main dashboard.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Already logged in, redirect to dashboard
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Welcome back, Admin!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid admin credentials.");
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-950 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-lawn-800/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-lawn-500 to-lawn-700 rounded-2xl flex items-center justify-center shadow-lg shadow-lawn-500/30 relative">
              <Leaf className="w-8 h-8 text-white" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-foreground rounded-full flex items-center justify-center border-2 border-card">
                <Shield className="w-3 h-3 text-lawn-500" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-display text-foreground">
            Admin Access
          </CardTitle>
          <CardDescription>
            Sign in to access the Lawn Guardian admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@lawnguardian.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="hero"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Not an admin?{" "}
              <a 
                href="/" 
                className="text-lawn-600 hover:text-lawn-700 dark:text-lawn-400 dark:hover:text-lawn-300 font-medium"
              >
                Return to homepage
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
