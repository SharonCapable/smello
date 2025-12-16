import React from 'react'

export default function PrivacyPage() {
  return (
    <main style={{padding: '2rem', maxWidth: 900, margin: '0 auto'}}>
      <h1>Privacy Policy</h1>
      <p>Last updated: December 16, 2025</p>

      <section>
        <h2>Summary</h2>
        <p>
          SMELLO (“we”, “us”) provides a product that helps teams generate and manage
          product content using AI. This privacy policy explains what data we collect,
          how we use it, and your rights.
        </p>
      </section>

      <section>
        <h2>Data we collect</h2>
        <ul>
          <li>Account information (email, name) obtained from Google when you sign in.</li>
          <li>Content you upload or authorize SMELLO to access (documents, queries).</li>
          <li>Usage metadata (timestamps, feature usage, logs).</li>
        </ul>
      </section>

      <section>
        <h2>How we use data</h2>
        <ul>
          <li>Authentication and account setup.</li>
          <li>Providing features such as search, collaboration, and AI generation.</li>
          <li>Improving and securing the service.</li>
        </ul>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          We use Google APIs for sign-in and optional generative features. When you enable
          integrations, content may be sent to third-party APIs (e.g. Google Generative API)
          with your explicit consent.
        </p>
      </section>

      <section>
        <h2>Retention and deletion</h2>
        <p>
          You can request account deletion; we will delete user content within 30 days unless
          legal requirements prevent deletion sooner.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          We follow industry practices to protect data: HTTPS in transit, secure storage of
          credentials, and access controls.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>For privacy requests or questions: sharon@ayadata.ai</p>
      </section>
    </main>
  )
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
                    <p className="text-muted-foreground">Last updated: December 2025</p>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h3 className="text-xl font-semibold">1. Introduction</h3>
                        <p>
                            SMELLO ("we", "our", or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the website.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">2. Information We Collect</h3>
                        <p>We collect several types of information from and about users of our Website, including:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li><strong>Personal Information:</strong> Name, email address, and profile picture when you sign in with Google.</li>
                            <li><strong>Usage Data:</strong> Information about how you access and use the Service.</li>
                            <li><strong>Project Data:</strong> Product ideas, user stories, and other content you generate using the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">3. How We Use Your Information</h3>
                        <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>To present our Website and its contents to you.</li>
                            <li>To provide you with information, products, or services that you request from us.</li>
                            <li>To fulfill any other purpose for which you provide it.</li>
                            <li>To notify you about changes to our Website or any products or services we offer or provide though it.</li>
                            <li>To allow you to participate in interactive features on our Website.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">4. AI Processing</h3>
                        <p>
                            When you use our AI features, your input data (prompts, product descriptions) is sent to third-party AI providers (Google Gemini, Anthropic Claude) for processing. We do not use your data to train these models, and your data is processed in accordance with their respective privacy policies.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">5. Data Security</h3>
                        <p>
                            We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. However, the transmission of information via the internet is not completely secure.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">6. Third-Party Services</h3>
                        <p>
                            We may use third-party Service Providers to monitor and analyze the use of our Service.
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li><strong>Google Analytics</strong></li>
                            <li><strong>Google OAuth</strong> (for authentication)</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">7. Children's Privacy</h3>
                        <p>
                            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">8. Changes to This Privacy Policy</h3>
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold">9. Contact Us</h3>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@smello.app.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    )
}
