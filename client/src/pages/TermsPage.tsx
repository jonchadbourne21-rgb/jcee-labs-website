import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090514] via-[#0f0a1a] to-[#090514] flex flex-col">
      <SiteNav />

      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="container max-w-3xl mx-auto">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white">Terms of Service</h1>
            <p className="text-muted-foreground text-sm font-mono">Last Updated: August 18, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-[#E2E8F0]/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">1. Agreement to Terms</h2>
              <p>
                By accessing or using the website jceelabs.com and any services provided by HOWM HOLDINGS LLC, doing business as JCEE Labs ("Company," "we," "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">2. Description of Services</h2>
              <p>
                JCEE Labs develops software and publishes technical research. The public website currently includes information about VOW, the QCS research program, Mirrored, the JCEE Labs Charter, and public research and evidence records. Product, research, and experiment status may change over time, and publication on this website does not by itself constitute a guarantee of production readiness, certification, or availability.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">3. User Accounts</h2>
              <p>
                Some features of our services may require account creation. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use our services for any unlawful purpose or in violation of any applicable laws</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the integrity or performance of our services</li>
                <li>Transmit any malicious code, viruses, or harmful content</li>
                <li>Scrape, mine, or collect data from our services without express permission</li>
                <li>Use our AI services to generate harmful, misleading, or illegal content</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">5. Intellectual Property</h2>
              <p>
                All content, features, and functionality of our services — including but not limited to text, graphics, logos, software, and design — are owned by HOWM HOLDINGS LLC or used with permission and may be protected by applicable intellectual property laws. Publicly released research materials may also carry their own stated terms, licenses, or publication conditions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">6. AI-Generated Content</h2>
              <p>
                Some services may produce AI-generated content such as text, analysis, or recommendations. AI outputs can be incomplete or incorrect and should not be treated as professional advice unless a separate written agreement expressly provides otherwise. You are responsible for reviewing outputs before relying on them for consequential decisions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">7. B2B Services</h2>
              <p>
                Custom development and B2B services are subject to separate agreements and statements of work. Pricing, deliverables, timelines, and intellectual property ownership for custom projects will be defined in the applicable written agreement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, HOWM HOLDINGS LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">9. Disclaimer of Warranties</h2>
              <p>
                Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, error-free, or secure. We disclaim all warranties including merchantability, fitness for a particular purpose, and non-infringement to the extent permitted by law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless HOWM HOLDINGS LLC, its officers, directors, employees, and agents from claims, damages, losses, or expenses arising from your use of our services or violation of these terms, to the extent permitted by applicable law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">11. Termination</h2>
              <p>
                We reserve the right to suspend or terminate access to services when reasonably necessary to protect users, systems, legal obligations, or the integrity of the service. Terms governing paid or contracted services may provide additional termination rights and procedures.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved as provided by applicable law and any controlling written agreement between the parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">13. Changes to Terms</h2>
              <p>
                We may update these Terms as our website and services change. Updated terms will be posted on this page with a revised "Last Updated" date. Additional notice or consent will be provided where required by applicable law or a separate agreement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">14. Contact</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-2">
                <p className="font-bold text-white">HOWM HOLDINGS LLC (d.b.a. JCEE Labs)</p>
                <p>Dallas, Texas</p>
                <p>Email: <a href="mailto:support@jceelabs.com" className="text-purple-400 hover:text-purple-300 transition-colors">support@jceelabs.com</a></p>
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
