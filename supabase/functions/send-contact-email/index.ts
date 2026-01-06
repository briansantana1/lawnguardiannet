import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ResendEmailResponse {
  id?: string;
  error?: { message: string };
}

const sendEmail = async (emailData: {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<ResendEmailResponse> => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate inputs
    if (!name || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim().slice(0, 100);
    const sanitizedEmail = email.trim().slice(0, 255);
    const sanitizedSubject = (subject || "Contact Form Submission").trim().slice(0, 200);
    const sanitizedMessage = message.trim().slice(0, 5000);

    console.log(`Sending contact email from ${sanitizedName} (${sanitizedEmail})`);

    // Send notification email to Lawn Guardian™
    const notificationResponse = await sendEmail({
      from: "Lawn Guardian™ <onboarding@resend.dev>",
      to: ["info.lawnguardian@yahoo.com"],
      replyTo: sanitizedEmail,
      subject: `[Contact Form] ${sanitizedSubject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 16px; }
            .label { font-weight: 600; color: #374151; font-size: 14px; }
            .value { margin-top: 4px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
            .message-box { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🌿 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">From:</div>
                <div class="value">${sanitizedName}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></div>
              </div>
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${sanitizedSubject}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value message-box">${sanitizedMessage.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (notificationResponse.error) {
      console.error("Resend error:", notificationResponse.error);
      throw new Error("Failed to send email");
    }

    // Send confirmation email to the user
    const confirmationResponse = await sendEmail({
      from: "Lawn Guardian <onboarding@resend.dev>",
      to: [sanitizedEmail],
      subject: "We received your message - Lawn Guardian",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🌿 Lawn Guardian</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for reaching out!</p>
            </div>
            <div class="content">
              <h2 style="margin-top: 0;">Hi ${sanitizedName},</h2>
              <p>We have received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you as soon as possible, typically within 1-2 business days.</p>
              <p>Here is a copy of your message:</p>
              <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 20px 0;">
                <strong>Subject:</strong> ${sanitizedSubject}<br><br>
                ${sanitizedMessage.replace(/\n/g, '<br>')}
              </div>
              <p>In the meantime, feel free to explore our AI-powered lawn care features to get personalized recommendations for your lawn!</p>
              <div class="footer">
                <p>Best regards,<br><strong>The Lawn Guardian™ Team</strong></p>
                <p style="font-size: 12px; color: #9ca3af;">
                  This is an automated response. Please do not reply directly to this email.<br>
                  For additional inquiries, contact us at info.lawnguardian@yahoo.com
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (confirmationResponse.error) {
      console.warn("Failed to send confirmation email:", confirmationResponse.error);
      // Don't fail the request if confirmation email fails
    }

    console.log("Contact email sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
