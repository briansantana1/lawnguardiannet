import { ArrowLeft, AlertTriangle, CreditCard, ShieldAlert, Scale, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";

export function TermsOfUse() {
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
          Terms of Use
        </h1>
        <p className="text-muted-foreground mb-4">Last updated: January 6, 2025</p>
        <p className="text-muted-foreground mb-8">Effective date: January 6, 2025</p>

        {/* Important Notice Box */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Important Legal Notice
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Please read these Terms of Use carefully before using the Lawn Guardian app. By downloading, installing, or using this app, you agree to be bound by these terms. If you disagree with any part of these terms, you may not use the app.
          </p>
        </div>
        
        <div className="prose prose-gray max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Lawn Guardian™. These Terms of Use ("Terms," "Agreement") constitute a legally binding agreement between you ("User," "you," "your") and Lawn Guardian™ ("Company," "we," "us," "our") governing your access to and use of the Lawn Guardian™ mobile application (the "App") and related services (collectively, the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              By creating an account, downloading, installing, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must immediately stop using the Service and uninstall the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 13 years old (or 16 in the European Economic Area) to use the Service. If you are under 18, you represent that you have your parent or guardian's permission to use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lawn Guardian is an AI-powered lawn care application that provides:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Image-based lawn disease, insect, and weed identification using artificial intelligence</li>
              <li>Personalized treatment recommendations using Integrated Pest Management (IPM) protocols</li>
              <li>Location-based weather forecasts and soil temperature monitoring</li>
              <li>Push notifications and alerts based on environmental conditions</li>
              <li>A database of common lawn issues with regional applicability</li>
              <li>Treatment plan storage, management, and history tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. User Accounts</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">4.1 Account Creation</h3>
            <p className="text-muted-foreground leading-relaxed">
              To access certain features of the Service, you must create an account. You may register using your email address or through third-party authentication services (Apple ID, Google). You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security and confidentiality of your login credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">4.2 Account Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time by contacting us at info.lawnguardian@yahoo.com. Upon account deletion, your personal data will be deleted in accordance with our Privacy Policy. We may terminate or suspend your account for violations of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              5. Subscriptions and Payments
            </h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">5.1 Free and Paid Features</h3>
            <p className="text-muted-foreground leading-relaxed">
              The App offers both free features with limited functionality and premium subscription plans ("Pro") with enhanced features. Free users receive a limited number of lawn scans per month.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">5.2 Subscription Plans</h3>
            <p className="text-muted-foreground leading-relaxed">
              We offer the following subscription options:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li><strong>Pro Monthly:</strong> $9.99 per month</li>
              <li><strong>Pro Annual:</strong> $79.99 per year</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Prices are in US dollars and may vary by region. Prices are subject to change with notice.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">5.3 Billing and Auto-Renewal</h3>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 my-4">
              <p className="text-foreground font-medium mb-2">⚠️ Auto-Renewal Notice</p>
              <p className="text-muted-foreground text-sm">
                Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period.
              </p>
            </div>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Payment will be charged to your Apple ID or Google Play account at confirmation of purchase</li>
              <li>Subscriptions automatically renew at the same price unless cancelled</li>
              <li>You can manage and cancel subscriptions in your device's account settings</li>
              <li>No refunds for partial subscription periods</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">5.4 How to Cancel</h3>
            <p className="text-muted-foreground leading-relaxed">
              <strong>For iOS (Apple):</strong> Go to Settings &gt; [Your Name] &gt; Subscriptions &gt; Lawn Guardian &gt; Cancel Subscription
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              <strong>For Android (Google Play):</strong> Go to Google Play Store &gt; Menu &gt; Subscriptions &gt; Lawn Guardian &gt; Cancel
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 my-4">
              <p className="text-foreground font-medium mb-2">📅 What happens when you cancel:</p>
              <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                <li>You will retain full access to Pro features until the end of your current billing period</li>
                <li>Your subscription will not renew after the current period ends</li>
                <li>After your subscription expires, you will be downgraded to the Free plan</li>
              </ul>
            </div>

            <h3 className="text-lg font-medium mt-4 mb-2">5.5 Refund Policy</h3>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 my-4">
              <p className="text-foreground font-medium mb-2">💳 Refund Information</p>
              <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-2">
                <li><strong>No prorated refunds:</strong> We do not provide refunds or credits for partial subscription periods. When you cancel, you keep access until the end of your current billing period.</li>
                <li><strong>Apple App Store:</strong> All refund requests for iOS purchases must be submitted directly to Apple through their refund process. We do not have the ability to issue refunds for App Store purchases.</li>
                <li><strong>Google Play Store:</strong> All refund requests for Android purchases must be submitted directly to Google through their refund process. We do not have the ability to issue refunds for Google Play purchases.</li>
                <li><strong>Annual subscriptions:</strong> If you purchased an annual subscription, the same policy applies - no prorated refunds for unused months.</li>
              </ul>
            </div>

          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Use of Service</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">6.1 License Grant</h3>
            <p className="text-muted-foreground leading-relaxed">
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to download, install, and use the App on a device you own or control for personal, non-commercial purposes.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">6.2 Prohibited Uses</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or its systems</li>
              <li>Interfere with or disrupt the Service, servers, or networks</li>
              <li>Reverse engineer, decompile, disassemble, or attempt to derive source code</li>
              <li>Copy, modify, distribute, sell, or lease any part of the Service</li>
              <li>Use automated systems (bots, scrapers) to access the Service</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Harvest or collect information about other users</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Circumvent any access restrictions or usage limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit, upload, or display through the Service, including lawn images and notes ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable license to use, reproduce, modify, adapt, process, and display such content solely for the purpose of providing, improving, and developing the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>You own or have the necessary rights to submit the User Content</li>
              <li>Your User Content does not violate any third-party rights</li>
              <li>Your User Content does not contain illegal or harmful content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              8. AI-Generated Recommendations Disclaimer
            </h2>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-muted-foreground">
              <p className="font-medium text-foreground mb-2">⚠️ Important Medical and Safety Disclaimer</p>
              <p className="leading-relaxed">
                The lawn care diagnoses, treatment recommendations, and other information provided by Lawn Guardian are generated by artificial intelligence and are for <strong>educational and informational purposes only</strong>. While we strive for accuracy using industry-leading AI technology (OpenAI), we cannot guarantee that AI-generated diagnoses will be 100% correct.
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Not Professional Advice:</strong> Recommendations should not be considered as professional lawn care, agricultural, or pest control advice</li>
                <li><strong>Consult Experts:</strong> For serious lawn issues, always consult with a qualified lawn care professional or your local agricultural extension office</li>
                <li><strong>Verify Recommendations:</strong> Cross-reference AI recommendations with authoritative sources</li>
                <li><strong>Weather Accuracy:</strong> Weather data is provided by third-party services and may not be completely accurate</li>
                <li><strong>Your Responsibility:</strong> You are solely responsible for any actions you take based on the Service's recommendations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Chemical Treatment Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service may provide recommendations for chemical treatments including pesticides, herbicides, fungicides, and fertilizers. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong>Legal Compliance:</strong> You are solely responsible for following all applicable local, state, federal, and international laws and regulations regarding the purchase, storage, handling, and application of lawn care chemicals</li>
              <li><strong>Product Labels:</strong> You must always read and follow all product labels, instructions, and safety data sheets (SDS)</li>
              <li><strong>Safety Equipment:</strong> You should wear appropriate personal protective equipment (PPE) when handling and applying chemicals</li>
              <li><strong>Professional Application:</strong> Some products may require professional application or licensing in your jurisdiction</li>
              <li><strong>Environmental Protection:</strong> You must comply with all environmental protection regulations</li>
              <li><strong>No Liability:</strong> We are not responsible for any harm, injury, damage, or legal issues resulting from your use of recommended products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content (excluding User Content), features, functionality, design, graphics, and trademarks are and will remain the exclusive property of Lawn Guardian™ and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws of the United States and foreign countries.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You may not use our trademarks, logos, or brand elements without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service integrates with and relies upon third-party services including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li><strong>Apple App Store / Google Play Store:</strong> For app distribution and in-app purchases</li>
              <li><strong>Authentication Providers:</strong> Apple ID, Google Sign-In</li>
              <li><strong>AI Services:</strong> OpenAI for lawn analysis and diagnosis</li>
              <li><strong>Weather Services:</strong> Third-party weather data providers</li>
              <li><strong>Cloud Infrastructure:</strong> Supabase for data storage</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Your use of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the availability, accuracy, or content of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              12. Disclaimer of Warranties
            </h2>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-muted-foreground">
              <p className="leading-relaxed uppercase text-sm">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY OF INFORMATION.
              </p>
              <p className="leading-relaxed uppercase text-sm mt-3">
                WE DO NOT WARRANT THAT: (A) THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE; (B) DEFECTS WILL BE CORRECTED; (C) THE SERVICE OR SERVERS ARE FREE OF VIRUSES OR HARMFUL COMPONENTS; (D) THE RESULTS OF USING THE SERVICE WILL MEET YOUR REQUIREMENTS; OR (E) AI-GENERATED DIAGNOSES AND RECOMMENDATIONS WILL BE ACCURATE.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Limitation of Liability</h2>
            <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-muted-foreground">
              <p className="leading-relaxed uppercase text-sm">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LAWN GUARDIAN, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 uppercase text-sm">
                <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE</li>
                <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE</li>
                <li>ANY CONTENT OBTAINED FROM THE SERVICE</li>
                <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
                <li>ANY RELIANCE ON AI-GENERATED RECOMMENDATIONS OR DIAGNOSES</li>
                <li>ANY DAMAGE TO YOUR LAWN, PROPERTY, PLANTS, OR HEALTH RESULTING FROM FOLLOWING RECOMMENDATIONS</li>
                <li>CHEMICAL TREATMENTS APPLIED BASED ON SERVICE RECOMMENDATIONS</li>
              </ul>
              <p className="leading-relaxed uppercase text-sm mt-3">
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless Lawn Guardian and its affiliates, officers, directors, employees, contractors, agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your User Content</li>
              <li>Your use or misuse of the Service</li>
              <li>Your application of lawn care treatments based on Service recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">15. Dispute Resolution</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">15.1 Informal Resolution</h3>
            <p className="text-muted-foreground leading-relaxed">
              Before filing any legal claim, you agree to try to resolve the dispute informally by contacting us at info.lawnguardian@yahoo.com. We will attempt to resolve the dispute within 60 days.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">15.2 Governing Law</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">15.3 Jurisdiction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in Delaware, and you consent to the personal jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">16. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Your right to use the Service will immediately cease</li>
              <li>You must uninstall and delete the App from your devices</li>
              <li>All provisions of these Terms that should survive termination will survive</li>
              <li>We are not obligated to refund any fees paid</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">17. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of material changes by:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Posting the updated Terms in the App</li>
              <li>Updating the "Last updated" date at the top</li>
              <li>Sending a notification through the App for significant changes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Your continued use of the Service after the effective date of changes constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">18. General Provisions</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">18.1 Entire Agreement</h3>
            <p className="text-muted-foreground leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Lawn Guardian™ regarding the Service and supersede all prior agreements.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">18.2 Severability</h3>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is held to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">18.3 Waiver</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">18.4 Assignment</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may not assign or transfer these Terms without our prior written consent. We may assign our rights and obligations without restriction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              19. App Store Terms
            </h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">19.1 Apple App Store</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you downloaded the App from the Apple App Store, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>These Terms are between you and Lawn Guardian, not Apple</li>
              <li>Apple has no obligation to provide maintenance or support for the App</li>
              <li>Apple is not responsible for any product warranties or claims</li>
              <li>Apple is not responsible for addressing any claims relating to the App</li>
              <li>Apple is a third-party beneficiary of these Terms</li>
              <li>You must comply with the App Store Terms of Service</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">19.2 Google Play Store</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you downloaded the App from Google Play, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>These Terms are between you and Lawn Guardian, not Google</li>
              <li>Google has no obligation to provide maintenance or support for the App</li>
              <li>Google is not responsible for any product warranties or claims</li>
              <li>You must comply with the Google Play Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">20. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Use, please contact us:
            </p>
            <div className="mt-4 p-4 bg-lawn-50 dark:bg-lawn-950/50 rounded-xl">
              <p className="font-medium text-foreground">Lawn Guardian</p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:info.lawnguardian@yahoo.com" className="text-primary hover:underline">
                  info.lawnguardian@yahoo.com
                </a>
              </p>
              <p className="text-muted-foreground mt-1">
                <strong>Subject Line:</strong> Terms of Use Inquiry
              </p>
            </div>
          </section>

          {/* Acceptance Footer */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mt-8">
            <p className="text-foreground font-medium text-center">
              By using Lawn Guardian™, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
