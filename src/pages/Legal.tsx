import { FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/BottomNavigation";

export function Legal() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
          Legal
        </h1>

        <div className="space-y-3">
          <Link to="/privacy">
            <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground">How we collect and use your data</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/terms">
            <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Terms of Use</h3>
                  <p className="text-sm text-muted-foreground">Terms and conditions for using the app</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
