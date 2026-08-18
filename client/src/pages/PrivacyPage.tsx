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
            <p className="text-muted-foreground text-sm font-mono">Last Updated: August 18, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-[#E2E8F0]/80 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">1. Introduction</h2>
              <p>
                HOWM HOLDINGS LLC, doing business as JCEE Labs ("we," "our," or "us"), respects your privacy. This Privacy Policy describes the information practices associated with the public JCEE Labs website at jceelabs.com.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">2. Information We Collect</h2>
              <p>Depending on how you use the site, we may receive or collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Information you provide:</strong> Information you voluntarily send to us, such as your name, email address, company information, and the contents of a message or inquiry.</li>
                <li><strong className="text-white">Site analytics:</strong> Basic information about use of the public website, such as pages viewed, referring sources, approximate session timing, browser type, and operating system, when analytics are enabled.</li>
                <li><strong className="text-white">Technical and security data:</strong> Hosting and infrastructure providers may process standard request and diagnostic information needed to deliver, secure, and troubleshoot the website.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">3. How We Use Information</h2>
              <p>We may use information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to messages and requests</li>
                <li>Operate, maintain, and secure the website</li>
                <li>Understand site performance and improve the public experience</li>
                <li>Investigate errors, abuse, or security incidents</li>
                <li>Comply with applicable legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">4. Data Sharing</h2>
              <p>
                We do not sell or rent personal information. We may share information with service providers that help us host, secure, analyze, or operate the website, and when disclosure is required by law or reasonably necessary to protect rights, safety, or the integrity of our systems.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">5. Data Security</h2>
              <p>
                We use reasonable technical and organizational measures intended to protect information associated with the site. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">6. Cookies and Similar Technologies</h2>
              <p>
                The site may use cookies, local storage, or similar browser technologies for functions such as preferences, sessions, and analytics where those features are enabled. Browser controls may allow you to restrict or clear these technologies, although doing so can affect site functionality.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">7. Your Choices and Rights</h2>
              <p>
                Depending on your location and the information involved, applicable law may provide rights concerning access, correction, deletion, portability, or certain uses of personal information. You may contact us to make a privacy-related request.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">8. Third-Party Services and Links</h2>
              <p>
                The website may rely on third-party hosting, analytics, infrastructure, or linked services. Their handling of information is governed by their own terms and privacy practices where applicable. Links to third-party websites do not make JCEE Labs responsible for those websites' privacy practices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">9. Children's Privacy</h2>
              <p>
                The public JCEE Labs website is not directed to children under 13, and we do not knowingly seek personal information from children under 13 through this site. If we learn that such information was collected through the site, we will take appropriate steps to address it.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy as our website and information practices change. When we do, we will post the updated policy here and revise the "Last Updated" date.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-bold text-white">11. Contact Us</h2>
              <p>
                For questions about this Privacy Policy or privacy-related requests, contact us at:
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
