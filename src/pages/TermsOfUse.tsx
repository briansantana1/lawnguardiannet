import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          Terms of Use
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: January 4, 2025</p>
        
        <div className="prose prose-gray max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Lawn Guardian. These Terms of Use ("Terms") govern your access to and use of the Lawn Guardian mobile application and related services (collectively, the "Service"). By downloading, installing, accessing, or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lawn Guardian is an AI-powered lawn care application that provides:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Image-based lawn disease, insect, and weed identification</li>
              <li>Personalized treatment recommendations using Integrated Pest Management (IPM) protocols</li>
              <li>Location-based weather forecasts and soil temperature monitoring</li>
              <li>Smart notifications and alerts based on environmental conditions</li>
              <li>A database of common lawn issues with regional applicability</li>
              <li>Treatment plan storage and management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security and confidentiality of your login credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Use of Service</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">4.1 Permitted Use</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may use the Service only for lawful purposes and in accordance with these Terms. You are granted a limited, non-exclusive, non-transferable, revocable license to use the Service for personal, non-commercial purposes.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">4.2 Prohibited Use</h3>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
              <li>Use any automated system to access the Service without our permission</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Impersonate any person or entity</li>
              <li>Use the Service to harvest or collect information about other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit, upload, or display through the Service, including lawn images ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of providing and improving the Service. You represent and warrant that you have all rights necessary to grant this license.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. AI-Generated Recommendations Disclaimer</h2>
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Important Notice:</p>
              <p className="leading-relaxed">
                The lawn care diagnoses, treatment recommendations, and other information provided by Lawn Guardian are generated by artificial intelligence and are for <strong>educational and informational purposes only</strong>. While we strive for accuracy, we cannot guarantee that AI-generated diagnoses will be 100% correct.
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Recommendations should not be considered as professional lawn care advice</li>
                <li>Always consult with a qualified lawn care professional for serious lawn issues</li>
                <li>Verify AI recommendations with local agricultural extension services when in doubt</li>
                <li>Weather data is provided by third-party services and may not be completely accurate</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Chemical Treatment Responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service may provide recommendations for chemical treatments including pesticides, herbicides, and fungicides. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>You are solely responsible for following all applicable local, state, and federal laws and regulations regarding the purchase, storage, and application of lawn care chemicals</li>
              <li>You must always read and follow product labels and safety data sheets</li>
              <li>You should wear appropriate personal protective equipment (PPE) when applying chemicals</li>
              <li>Some products may require professional application or licensing</li>
              <li>We are not responsible for any harm resulting from improper use of recommended products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Lawn Guardian and its licensors. The Service is protected by copyright, trademark, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service may contain links to or integrate with third-party websites, services, or applications. We are not responsible for the content, privacy policies, or practices of any third-party services. Your use of third-party services is at your own risk and subject to the terms and conditions of those services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LAWN GUARDIAN, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-3">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              <li>Any reliance on AI-generated recommendations or diagnoses</li>
              <li>Any damage to your lawn, property, or health resulting from following recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless Lawn Guardian and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will immediately cease. You may also delete your account at any time through the app settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in the United States.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">15. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. We will provide notice of material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">16. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">17. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Use, please contact us at:
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
