import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Mail, BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications, type NotificationPreference } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface NotificationSchedulerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: {
    id: string;
    product: string;
    applicationDate: Date;
    notes?: string;
  } | null;
  onSuccess?: () => void;
}

export function NotificationScheduler({ open, onOpenChange, treatment, onSuccess }: NotificationSchedulerProps) {
  const { user } = useAuth();
  const { permission, requestPermission, isSupported } = useNotifications();
  const [notificationType, setNotificationType] = useState<NotificationPreference>("browser");
  const [email, setEmail] = useState(user?.email || "");
  const [isScheduling, setIsScheduling] = useState(false);

  const handleScheduleReminder = async () => {
    if (!treatment || !user) {
      toast.error("Please sign in to schedule reminders");
      return;
    }

    // Request browser notification permission if needed
    if ((notificationType === "browser" || notificationType === "both") && permission !== "granted") {
      const granted = await requestPermission();
      if (!granted && notificationType === "browser") {
        toast.error("Browser notification permission is required");
        return;
      }
    }

    // Validate email if email notifications selected
    if ((notificationType === "email" || notificationType === "both") && !email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsScheduling(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in again");
        return;
      }

      const { error } = await supabase.functions.invoke("send-treatment-reminder", {
        body: {
          reminder: {
            treatmentId: treatment.id,
            product: treatment.product,
            // Send date-only to avoid timezone shifting (e.g., 1/10 showing as 1/9)
            applicationDate: format(treatment.applicationDate, "yyyy-MM-dd"),
            notes: treatment.notes,
            notificationType,
            email: notificationType === "email" || notificationType === "both" ? email : undefined,
          },
        },
      });

      if (error) throw error;

      const reminderTypes = [];
      if (notificationType === "browser" || notificationType === "both") {
        reminderTypes.push("browser notifications");
      }
      if (notificationType === "email" || notificationType === "both") {
        reminderTypes.push("email reminder");
      }

      toast.success(`Reminder scheduled!`, {
        description: `You'll receive ${reminderTypes.join(" and ")} for ${treatment.product}`,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      toast.error("Failed to schedule reminder");
    } finally {
      setIsScheduling(false);
    }
  };

  if (!treatment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-primary" />
            Schedule Reminder
          </DialogTitle>
          <DialogDescription>
            Get notified about your upcoming treatment for {treatment.product}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label>Notification Method</Label>
            <RadioGroup
              value={notificationType}
              onValueChange={(value) => setNotificationType(value as NotificationPreference)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="browser" id="browser" />
                <Label htmlFor="browser" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Bell className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Browser Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      {isSupported 
                        ? permission === "granted" 
                          ? "Enabled" 
                          : "Permission required"
                        : "Not supported on this browser"}
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Email Reminder</p>
                    <p className="text-xs text-muted-foreground">Receive an email before treatment day</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex items-center gap-2 cursor-pointer flex-1">
                  <BellRing className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">Both</p>
                    <p className="text-xs text-muted-foreground">Get browser and email reminders</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {(notificationType === "email" || notificationType === "both") && (
            <div className="space-y-2">
              <Label htmlFor="reminder-email">Email Address</Label>
              <Input
                id="reminder-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">You'll be reminded:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Day before treatment (9:00 AM)</li>
              <li>Day of treatment (8:00 AM)</li>
            </ul>
          </div>

          <Button
            onClick={handleScheduleReminder}
            disabled={isScheduling}
            variant="scan"
            className="w-full"
          >
            {isScheduling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4 mr-2" />
                Schedule Reminder
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
