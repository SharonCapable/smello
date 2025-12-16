import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: December 2025</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-xl font-semibold">1. Agreement to Terms</h3>
            <p>
              By accessing or using SMELLO ("the Service"), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">2. Use License</h3>
            <p>
              Permission is granted to temporarily access the materials (information or software) on SMELLO for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">3. AI Services Usage</h3>
            <p>
              Our Service utilizes Artificial Intelligence (AI) technologies provided by third parties (Google Gemini, Anthropic Claude). By using these features, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>AI-generated content may not always be accurate or error-free.</li>
              <li>You are responsible for verifying any output before use.</li>
              <li>Usage is subject to fair use limits (6 operations per session for guests).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold">4. User Accounts</h3>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">5. Intellectual Property</h3>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of SMELLO and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">6. Termination</h3>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">7. Limitation of Liability</h3>
            <p>
              In no event shall SMELLO, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">8. Changes</h3>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold">9. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at support@smello.app.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
