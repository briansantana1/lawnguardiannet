/**
 * Admin Dashboard
 * 
 * Protected admin area for managing the Lawn Guardian app.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Leaf, 
  Users, 
  FileText, 
  Bell, 
  LogOut, 
  Shield,
  Loader2,
  Calendar,
  TrendingUp,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  totalPlans: number;
  totalNotifications: number;
  totalCalendarEntries: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPlans: 0,
    totalNotifications: 0,
    totalCalendarEntries: 0,
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/admin");
        return;
      }

      setUserEmail(session.user.email || null);

      // Check if user is admin using the is_admin function
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin', { _user_id: session.user.id });

      if (adminError || !adminCheck) {
        toast.error("Access denied. Admin privileges required.");
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }

      setIsAdmin(true);
      await fetchStats();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch counts from various tables
      const [usersRes, plansRes, notificationsRes, calendarRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("saved_treatment_plans").select("id", { count: "exact", head: true }),
        supabase.from("notification_schedules").select("id", { count: "exact", head: true }),
        supabase.from("treatment_calendar_entries").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalPlans: plansRes.count || 0,
        totalNotifications: notificationsRes.count || 0,
        totalCalendarEntries: calendarRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lawn-950 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lawn-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-50 to-background dark:from-lawn-950 dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-lawn-400 to-lawn-600 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  Admin Dashboard
                  <Shield className="w-4 h-4 text-lawn-500" />
                </h1>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back, Admin</h2>
          <p className="text-muted-foreground">Here's an overview of your Lawn Guardian™ app.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-lawn-500 to-lawn-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Treatment Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalPlans}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalNotifications}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendar Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalCalendarEntries}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-lawn-500" />
                Analytics
              </CardTitle>
              <CardDescription>View detailed app usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-500" />
                User Management
              </CardTitle>
              <CardDescription>Manage users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="border-lawn-200 dark:border-lawn-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-lawn-500" />
                Site Settings
              </CardTitle>
              <CardDescription>Edit URLs, text, and site content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="default" className="w-full" onClick={() => navigate("/admin/settings")}>
                Manage Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* App Links */}
        <div className="mt-8 p-6 bg-card rounded-2xl border border-border">
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              View Landing Page
            </Button>
            <Button variant="outline" onClick={() => navigate("/app")}>
              Open App
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
