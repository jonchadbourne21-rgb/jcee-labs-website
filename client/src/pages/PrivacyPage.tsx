import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm font-mono">Last Updated: July 14, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-[#E2E8F0]/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">1. Introduction</h2>
              <p>
                HOWM HOLDINGS LLC, doing business as Jcee Labs ("we," "our," or "us"), respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website jceelabs.com and use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">2. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Contact Information:</strong> Email address, name, phone number, and company name when you submit forms or sign up for our newsletter.</li>
                <li><strong className="text-white">Business Inquiry Data:</strong> Project descriptions, budget ranges, and timeline preferences submitted through our contact forms.</li>
                <li><strong className="text-white">Usage Data:</strong> Information about how you interact with our website, including pages visited, time spent, and referring sources.</li>
                <li><strong className="text-white">Device Information:</strong> Browser type, operating system, and device identifiers collected through standard web technologies.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to your inquiries and provide requested services</li>
                <li>Send you updates about our products and services (with your consent)</li>
                <li>Improve our website and user experience</li>
                <li>Analyze usage patterns to enhance our offerings</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">4. Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">6. Cookies</h2>
              <p>
                Our website uses cookies and similar tracking technologies to enhance your browsing experience. You can control cookie preferences through your browser settings. Essential cookies required for site functionality cannot be disabled.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">7. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">8. Third-Party Services</h2>
              <p>
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to read the privacy policies of any third-party services you interact with.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">9. Children's Privacy</h2>
              <p>
                Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 13, we will take steps to delete that information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after changes are posted constitutes acceptance of the revised policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">11. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
              </p>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-2">
                <p className="font-bold text-white">HOWM HOLDINGS LLC (d.b.a. Jcee Labs)</p>
                <p>Dallas, Texas</p>
                <p>Website: <a href="https://jceelabs.com" className="text-purple-400 hover:text-purple-300 transition-colors">jceelabs.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
