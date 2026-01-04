import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

async function sendEmail(payload: ResendEmailPayload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TreatmentReminder {
  treatmentId: string;
  product: string;
  applicationDate: string;
  notes?: string;
  notificationType: "browser" | "email" | "both";
  email?: string;
}

serve(async (req) => {
  console.log("send-treatment-reminder: Request received", req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      console.error("send-treatment-reminder: No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("send-treatment-reminder: User auth failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reminder } = await req.json() as { reminder: TreatmentReminder };
    console.log("send-treatment-reminder: Processing reminder for", reminder.product);

    const results = {
      emailSent: false,
      notificationScheduled: false,
    };

function parseIncomingDate(value: string): Date {
  // Accept either ISO string or YYYY-MM-DD (sent from the web app to avoid TZ shifting)
  if (value.includes("T")) return new Date(value);
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

// Send email reminder if requested
    if ((reminder.notificationType === "email" || reminder.notificationType === "both") && reminder.email) {
      try {
        const applicationDate = parseIncomingDate(reminder.applicationDate);
        const formattedDate = applicationDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const emailResponse = await sendEmail({
          from: "Lawn Scout <onboarding@resend.dev>",
          to: [reminder.email],
          subject: `🌿 Treatment Reminder: ${reminder.product}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🌿 Treatment Reminder</h1>
              </div>
              
              <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
                <h2 style="color: #16a34a; margin-top: 0;">Time to apply: ${reminder.product}</h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                  <p style="margin: 0 0 10px 0;"><strong>📅 Scheduled Date:</strong> ${formattedDate}</p>
                  ${reminder.notes ? `<p style="margin: 0;"><strong>📝 Notes:</strong> ${reminder.notes}</p>` : ""}
                </div>

                <h3 style="color: #475569;">Quick Tips:</h3>
                <ul style="color: #64748b; padding-left: 20px;">
                  <li>Check weather conditions before applying</li>
                  <li>Follow product instructions carefully</li>
                  <li>Water lawn as recommended after application</li>
                  <li>Keep children and pets off treated areas as directed</li>
                </ul>

                <div style="text-align: center; margin-top: 30px;">
                  <p style="color: #94a3b8; font-size: 14px;">
                    Happy lawn care! 🏡<br>
                    - Lawn Scout Team
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log("send-treatment-reminder: Email sent successfully:", emailResponse);
        results.emailSent = true;
      } catch (emailError) {
        console.error("send-treatment-reminder: Email send failed:", emailError);
      }
    }

    // Schedule database notification for browser push
    if (reminder.notificationType === "browser" || reminder.notificationType === "both") {
      try {
        const applicationDate = parseIncomingDate(reminder.applicationDate);
        
        // Schedule reminder for day before at 9 AM
        const dayBeforeReminder = new Date(applicationDate);
        dayBeforeReminder.setDate(dayBeforeReminder.getDate() - 1);
        dayBeforeReminder.setHours(9, 0, 0, 0);

        // Schedule reminder for day of at 8 AM
        const dayOfReminder = new Date(applicationDate);
        dayOfReminder.setHours(8, 0, 0, 0);

        const notifications = [
          {
            user_id: user.id,
            title: `🌿 Tomorrow: Apply ${reminder.product}`,
            message: `Don't forget! Tomorrow is your scheduled treatment day for ${reminder.product}.${reminder.notes ? ` Notes: ${reminder.notes}` : ""}`,
            category: "treatment_reminder",
            priority: "medium",
            scheduled_for: dayBeforeReminder.toISOString(),
            weather_context: {
              product: reminder.product,
              applicationDate: reminder.applicationDate,
              notes: reminder.notes,
              type: "day_before",
            },
          },
          {
            user_id: user.id,
            title: `🌿 Today: Apply ${reminder.product}`,
            message: `Today is your treatment day! Apply ${reminder.product} as planned.${reminder.notes ? ` Notes: ${reminder.notes}` : ""}`,
            category: "treatment_reminder",
            priority: "high",
            scheduled_for: dayOfReminder.toISOString(),
            weather_context: {
              product: reminder.product,
              applicationDate: reminder.applicationDate,
              notes: reminder.notes,
              type: "day_of",
            },
          },
        ];

        const { error: insertError } = await supabase
          .from("notification_schedules")
          .insert(notifications);

        if (insertError) {
          console.error("send-treatment-reminder: DB insert failed:", insertError);
        } else {
          console.log("send-treatment-reminder: Notifications scheduled in DB");
          results.notificationScheduled = true;
        }
      } catch (dbError) {
        console.error("send-treatment-reminder: DB operation failed:", dbError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `Reminder set for ${reminder.product}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-treatment-reminder: Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
