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
