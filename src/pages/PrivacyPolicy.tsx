import { ArrowLeft, Shield, Database, Eye, Trash2, Globe, Bell, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";

export function PrivacyPolicy() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-4">Last updated: January 6, 2025</p>
        <p className="text-muted-foreground mb-8">Effective date: January 6, 2025</p>
        
        {/* Quick Summary Box */}
        <div className="bg-lawn-50 dark:bg-lawn-950/50 border border-lawn-200 dark:border-lawn-800 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy at a Glance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Database className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Data We Collect</p>
                <p className="text-muted-foreground">Photos, location, account info</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">How We Use It</p>
                <p className="text-muted-foreground">Lawn analysis & recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Data Security</p>
                <p className="text-muted-foreground">Encrypted & securely stored</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trash2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Your Control</p>
                <p className="text-muted-foreground">Delete your data anytime</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="prose prose-gray max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lawn Guardian™ ("we," "our," "us," or the "Company") operates the Lawn Guardian™ mobile application (the "App") available on Apple App Store and Google Play Store. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our App and related services (collectively, the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By downloading, installing, or using the App, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with this Privacy Policy, please do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">2.1 Information You Provide Directly</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> When you create an account, we collect your email address. If you use Sign in with Apple or Google Sign-In, we receive the information you authorize those services to share.</li>
              <li><strong>Profile Information:</strong> You may optionally provide your display name, location (city/state), and grass type preferences.</li>
              <li><strong>Lawn Images:</strong> Photos you upload or capture using the App for AI-powered lawn analysis. These images are processed to identify lawn problems and generate treatment recommendations.</li>
              <li><strong>Saved Treatment Plans:</strong> Diagnosis results, treatment recommendations, and any notes you add to saved plans.</li>
              <li><strong>Customer Support:</strong> Information you provide when contacting us for support, including your email and description of issues.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Precise Location Data:</strong> With your explicit permission, we collect your device's precise geolocation to provide localized weather forecasts, soil temperature data, and region-specific lawn care recommendations. You can disable location access at any time through your device settings.</li>
              <li><strong>Device Information:</strong> Device type, model, operating system version, unique device identifiers (such as IDFA for iOS or Advertising ID for Android), and mobile network information.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with the App, including features used, screens viewed, actions taken, and time spent in the App.</li>
              <li><strong>Crash and Performance Data:</strong> Technical information to help us identify and fix bugs, including crash logs and performance metrics.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.3 Information from Third-Party Services</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Authentication Providers:</strong> If you sign in using Apple ID or Google, we receive your name (if provided) and email address as authorized by you.</li>
              <li><strong>Weather API Providers:</strong> We receive weather data based on your location to provide lawn care recommendations.</li>
              <li><strong>Plant.id API:</strong> Lawn images are processed through Plant.id's AI service for plant, disease, and pest identification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use the information we collect for the following purposes:</p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 To Provide and Improve the Service</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Analyze lawn images using AI to identify diseases, insects, weeds, and other lawn problems</li>
              <li>Generate personalized treatment recommendations based on identified issues</li>
              <li>Provide location-based weather alerts and lawn care notifications</li>
              <li>Save and manage your treatment plans and lawn care history</li>
              <li>Improve our AI models and recommendation accuracy</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 To Communicate With You</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Send push notifications about weather alerts, treatment reminders, and lawn care tips (with your permission)</li>
              <li>Respond to your customer support inquiries</li>
              <li>Send important service-related announcements</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.3 For Analytics and Security</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Monitor and analyze usage trends to improve user experience</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. How We Share Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We may share your information in the following circumstances:</p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">4.1 Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed">
              We share information with third-party vendors who perform services on our behalf:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Cloud Hosting:</strong> Supabase (database and file storage)</li>
              <li><strong>AI Processing:</strong> Plant.id API (lawn image analysis)</li>
              <li><strong>Weather Data:</strong> Weather API providers</li>
              <li><strong>Authentication:</strong> Apple and Google sign-in services</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4.2 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose your information if required by law, court order, or government request, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">4.3 Business Transfers</h3>
            <p className="text-muted-foreground leading-relaxed">
              If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.
            </p>

            <div className="bg-lawn-100 dark:bg-lawn-900/50 rounded-xl p-4 mt-4">
              <p className="text-foreground font-medium">
                🔒 We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong>Account Data:</strong> Retained until you delete your account</li>
              <li><strong>Lawn Images:</strong> Stored as long as you keep them in your saved plans; automatically deleted when you delete the plan or your account</li>
              <li><strong>Usage Analytics:</strong> Aggregated and anonymized data may be retained indefinitely for service improvement</li>
              <li><strong>Legal Requirements:</strong> We may retain certain data as required by law or for legitimate business purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong>Encryption:</strong> Data is encrypted in transit (TLS/SSL) and at rest</li>
              <li><strong>Secure Authentication:</strong> We use secure authentication methods including OAuth 2.0</li>
              <li><strong>Access Controls:</strong> Access to personal data is restricted to authorized personnel only</li>
              <li><strong>Regular Audits:</strong> We conduct regular security assessments</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h2>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
              <p className="text-foreground font-medium mb-2">📱 How to Exercise Your Rights</p>
              <p className="text-muted-foreground text-sm">
                You can manage most privacy settings directly in the App. For account deletion or data export requests, contact us at info.lawnguardian@yahoo.com.
              </p>
            </div>

            <h3 className="text-lg font-medium mt-4 mb-2">7.1 Access and Portability</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can access your account information and saved plans directly in the App. You may request a copy of your personal data by contacting us.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">7.2 Correction</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can update your profile information, grass type preferences, and saved plan notes directly in the App.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">7.3 Deletion (Right to be Forgotten)</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can delete individual saved plans within the App. To delete your entire account and all associated data, contact us at info.lawnguardian@yahoo.com. We will process your request within 30 days.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">7.4 Location Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can enable or disable location services at any time through your device settings (iOS: Settings &gt; Privacy &gt; Location Services; Android: Settings &gt; Location). Disabling location may limit weather-based features.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">7.5 Push Notifications</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can manage notification preferences in the App settings or through your device's notification settings.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">7.6 Camera and Photo Library Access</h3>
            <p className="text-muted-foreground leading-relaxed">
              The App requests access to your camera and photo library to enable lawn photo uploads. You can revoke this access at any time through your device settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Children's Privacy (COPPA Compliance)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not directed to children under the age of 13 (or 16 in the European Economic Area). We do not knowingly collect personal information from children under these ages. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at info.lawnguardian@yahoo.com. If we discover that we have collected personal information from a child in violation of applicable law, we will delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence, including the United States. These countries may have different data protection laws. When we transfer your information, we ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. California Privacy Rights (CCPA/CPRA)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong>Right to Know:</strong> You can request information about the categories and specific pieces of personal information we have collected about you</li>
              <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
              <li><strong>Right to Correct:</strong> You can request correction of inaccurate personal information</li>
              <li><strong>Right to Opt-Out:</strong> We do not sell personal information, so this right does not apply</li>
              <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise these rights, contact us at info.lawnguardian@yahoo.com. We will verify your identity before processing your request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. European Privacy Rights (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong>Legal Basis:</strong> We process your data based on consent (for location and notifications), contract performance (to provide the Service), and legitimate interests (for analytics and security)</li>
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data in a structured format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise these rights or file a complaint, contact us at info.lawnguardian@yahoo.com. You also have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Third-Party Links and Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The App may contain links to third-party websites or services. This Privacy Policy does not apply to those third parties. We encourage you to review the privacy policies of any third-party services you access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Posting the new Privacy Policy in the App</li>
              <li>Updating the "Last updated" date at the top of this policy</li>
              <li>Sending you a push notification or email for significant changes (where appropriate)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We encourage you to review this Privacy Policy periodically. Your continued use of the App after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-lawn-50 dark:bg-lawn-950/50 rounded-xl">
              <p className="font-medium text-foreground">Lawn Guardian™</p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:info.lawnguardian@yahoo.com" className="text-primary hover:underline">
                  info.lawnguardian@yahoo.com
                </a>
              </p>
              <p className="text-muted-foreground mt-1">
                <strong>Subject Line:</strong> Privacy Policy Inquiry
              </p>
              <p className="text-muted-foreground mt-3 text-sm">
                We will respond to your inquiry within 30 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">15. App Store Specific Disclosures</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Apple App Store</h3>
            <p className="text-muted-foreground leading-relaxed">
              In accordance with Apple's App Store Guidelines, we disclose that this App collects the following data types as shown in our App Store privacy nutrition labels:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Contact Info:</strong> Email address (for account creation)</li>
              <li><strong>User Content:</strong> Photos (lawn images for analysis)</li>
              <li><strong>Location:</strong> Precise location (for weather features, with permission)</li>
              <li><strong>Identifiers:</strong> Device ID (for analytics)</li>
              <li><strong>Usage Data:</strong> App interactions (for improving the Service)</li>
              <li><strong>Diagnostics:</strong> Crash data (for bug fixes)</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Google Play Store</h3>
            <p className="text-muted-foreground leading-relaxed">
              In accordance with Google Play's Data Safety requirements, we confirm that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Data is encrypted in transit</li>
              <li>You can request data deletion</li>
              <li>We do not share data with third parties for advertising purposes</li>
              <li>This app follows Google Play's Families Policy (not directed to children)</li>
            </ul>
          </section>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
