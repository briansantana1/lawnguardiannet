import { ScrollArea } from "@/components/ui/scroll-area";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: January 4, 2025</p>
        
        <div className="prose prose-gray max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lawn Guardian ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the "Service"). Please read this privacy policy carefully. By using the Service, you consent to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Account Information:</strong> When you create an account, we collect your email address and password.</li>
              <li><strong>Profile Information:</strong> You may optionally provide your name, location, and grass type preferences.</li>
              <li><strong>Lawn Images:</strong> Photos you upload for AI-powered lawn analysis.</li>
              <li><strong>Treatment Plans:</strong> Data related to saved diagnosis and treatment recommendations.</li>
              <li><strong>Communications:</strong> Information you provide when contacting customer support.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Location Data:</strong> With your permission, we collect precise geolocation data to provide localized weather forecasts, soil temperature data, and region-specific lawn care recommendations.</li>
              <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers, and mobile network information.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our Service, including features used and time spent.</li>
              <li><strong>Log Data:</strong> Server logs that may include IP address, browser type, and pages visited.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.3 Third-Party Services</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use third-party services that may collect information, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Weather APIs:</strong> To provide real-time weather and soil temperature data based on your location.</li>
              <li><strong>AI Services:</strong> To analyze lawn images and generate treatment recommendations.</li>
              <li><strong>Analytics:</strong> To understand how users interact with our Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Analyze lawn images using AI to identify diseases, insects, and weeds</li>
              <li>Generate personalized treatment recommendations</li>
              <li>Deliver location-based weather alerts and lawn care notifications</li>
              <li>Send scheduled smart notifications based on weather conditions</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze usage trends to improve user experience</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Sharing of Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf, such as AI processing, cloud hosting, and analytics.</li>
              <li><strong>Legal Requirements:</strong> If required by law or in response to valid legal requests.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
              <li><strong>With Your Consent:</strong> When you explicitly consent to sharing.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>We do not sell your personal information to third parties.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us. We will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit and at rest, secure authentication systems, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access and Update:</strong> You can access and update your account information through the app settings.</li>
              <li><strong>Delete Account:</strong> You may request deletion of your account by contacting us.</li>
              <li><strong>Location Data:</strong> You can disable location services through your device settings, though this may limit certain features.</li>
              <li><strong>Notifications:</strong> You can manage notification preferences within the app or through your device settings.</li>
              <li><strong>Marketing Communications:</strong> You can opt out of marketing emails by following the unsubscribe link.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Service, you consent to the transfer of your information to these countries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. California Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete your personal information, and the right to opt-out of the sale of personal information. We do not sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Continued use of the Service after changes constitutes acceptance of the modified policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-lawn-50 rounded-xl">
              <p className="font-medium text-foreground">Lawn Guardian</p>
              <p className="text-muted-foreground">Email: <a href="mailto:info.lawnguardian@yahoo.com" className="text-primary hover:underline">info.lawnguardian@yahoo.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
