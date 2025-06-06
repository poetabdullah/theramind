import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6">
          Terms and Conditions for TheraMind
        </h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: June 6, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="mb-4">
              Please read these Terms and Conditions (“Terms”) carefully before
              using our Service. By accessing or using TheraMind, you agree to
              be bound by these Terms. If you do not agree with any part of
              these Terms, you must not use the Service.
            </p>
            <p>
              TheraMind is a final-year university project from University of
              Management and Technology Lahore. It is developed and operated by
              <strong> Abdullah Imran</strong>, <strong>Hamda Qadeer</strong>,
              and <strong>Ambreen</strong>.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              Interpretation and Definitions
            </h3>

            <h4 className="text-lg font-medium mb-2">Interpretation</h4>
            <p className="mb-4">
              Words with initial capitalization have specific meanings defined
              in this section. These definitions apply whether appearing in
              singular or plural form.
            </p>

            <h4 className="text-lg font-medium mb-2">Definitions</h4>
            <p className="mb-2">For the purposes of these Terms:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Affiliate</strong> means any entity that controls, is
                controlled by, or is under common control with a party, where
                “control” means ownership of 50% or more of the shares or voting
                interest.
              </li>
              <li>
                <strong>Company</strong> (“We”, “Us”, or “Our”) refers to
                TheraMind.
              </li>
              <li>
                <strong>Country</strong> refers to: Pakistan.
              </li>
              <li>
                <strong>Device</strong> means any device capable of accessing
                the Service (computer, smartphone, tablet).
              </li>
              <li>
                <strong>Service</strong> refers to TheraMind’s website and
                associated features, accessible via{" "}
                <a
                  href="https://theramind.site"
                  className="text-blue-600 hover:underline"
                >
                  theramind.site
                </a>{" "}
                or{" "}
                <a
                  href="https://thera-mind.web.app/"
                  className="text-blue-600 hover:underline"
                >
                  thera-mind.web.app
                </a>
                .
              </li>
              <li>
                <strong>Terms and Conditions</strong> (“Terms”) means this
                document that governs the use of the Service.
              </li>
              <li>
                <strong>Third‐Party Social Media Service</strong> refers to any
                service or content provided by a third party that may be
                displayed, included, or made available via the Service.
              </li>
              <li>
                <strong>Workspace API Data</strong> refers to any user data
                accessed through Google Workspace APIs (such as Gmail, Calendar,
                Drive, Docs) when the user authorizes TheraMind to access their
                Workspace resources.
              </li>
              <li>
                <strong>You</strong> means the individual or entity accessing or
                using the Service.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Acknowledgment</h3>
            <p className="mb-4">
              These Terms govern your relationship with TheraMind. By using the
              Service, you agree to comply with these Terms in full. If you
              disagree with any part, you must not use the Service.
            </p>
            <p>
              You must be at least 16 years old to use this Service. We do not
              knowingly allow those under 16 to register or use TheraMind. Your
              use of the Service is also subject to our Privacy Policy, which is
              incorporated by reference.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              User Accounts and Permissions
            </h3>
            <p className="mb-4">
              To access certain features of TheraMind, you must create an
              account using a valid email address using third‐party login from
              Google. During registration, we collect your name, email address,
              and profile picture. You grant us permission to access and store
              this information.
            </p>
            <p className="mb-4">
              When you schedule sessions or join meetings via TheraMind, we may
              request permission to access your Google Calendar (or other
              calendar services) to create, view, or modify events. We also
              request microphone and camera permissions for live sessions. You
              may revoke these permissions at any time via your device or
              account settings, but revoking permissions may impair your ability
              to use certain Service features.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. You agree to notify us immediately of any
              unauthorized use of your account or any other breach of security.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              Use of Workspace API Data
            </h3>
            <p className="mb-4">
              If you authorize the Service to access your Google Workspace
              resources (e.g., Gmail, Calendar, Drive), we will access only the
              data strictly required to provide the Service features you request
              (such as generating a meeting link or retrieving your calendar
              events). We <strong>do not</strong> retain, aggregate, or use any
              Workspace API Data to develop, train, or improve any generalized
              AI or machine learning models outside the scope of your individual
              account usage.
            </p>
            <p className="mb-4">
              Any Workspace API Data that is stored temporarily (e.g., for
              scheduling meetings in real time) will be deleted immediately
              after the operation completes, unless you explicitly request
              otherwise. We will not use that data for analytics, data mining,
              or training algorithms unrelated to your direct use of the
              Service.
            </p>
            <p>
              By authorizing access to your Workspace account, you consent to
              this limited use. You may revoke this authorization at any time by
              disabling TheraMind’s access in your Google Account’s “Security &
              Privacy” settings.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              Intellectual Property Rights
            </h3>
            <p className="mb-4">
              All content, features, and functionality provided under the
              Service—including but not limited to text, graphics, logos, icons,
              images, audio clips, digital downloads, and software—are the
              exclusive property of TheraMind or its licensors and are protected
              by applicable copyright, trademark, and other intellectual
              property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works
              of, publicly display, publicly perform, republish, download,
              store, or transmit any of the material except as follows:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                Your computer or mobile device may temporarily store copies of
                such materials for caching purposes only.
              </li>
              <li>
                You may store or download one copy of a reasonable number of
                pages of the Service for offline viewing, provided you
                explicitly agree not to delete or alter any trademark, logo, or
                copyright notice.
              </li>
              <li>
                If we provide desktop, mobile, or other applications for
                download, you may download a single copy to your device and use
                it solely as permitted by the license agreement accompanying
                such applications.
              </li>
            </ul>
            <p className="mt-4">
              Any other use of the materials is strictly prohibited. If you
              breach any provision of these Terms, your right to use the Service
              will automatically terminate.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Prohibited Conduct</h3>
            <p className="mb-4">
              You agree not to do any of the following while using TheraMind:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Use the Service for any unlawful purpose or to solicit others to
                perform or participate in any unlawful acts.
              </li>
              <li>
                Violate any applicable local, national, or international law or
                regulation.
              </li>
              <li>
                Infringe or violate our intellectual property rights or those of
                others.
              </li>
              <li>
                Upload or transmit viruses, malware, or any other malicious
                code.
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service or third-party data contained therein.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service,
                other accounts, or computer systems or networks connected to the
                Service.
              </li>
              <li>
                Use any robot, spider, scraper, or other automated means to
                access the Service for any purpose without our express written
                permission.
              </li>
              <li>
                Harass, annoy, intimidate, or threaten any of our employees,
                agents, or other users of the Service.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              Links to Other Websites
            </h3>
            <p className="mb-4">
              Our Service may contain links to third-party websites or services
              not owned or controlled by the Company. We assume no
              responsibility for the content, privacy policies, or practices of
              those third-party sites. We recommend you review the terms and
              privacy policies of any third‐party site you visit.
            </p>
            <p>
              The inclusion of any link does not imply endorsement by us of the
              linked site or any association with its operators.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Termination</h3>
            <p>
              We may suspend or terminate your access to the Service
              immediately, without prior notice or liability, for any reason,
              including if you breach these Terms. Upon termination, your right
              to use the Service will cease immediately. Sections which by their
              nature should survive termination will remain in effect.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              Limitation of Liability
            </h3>
            <p className="mb-4">
              In no event shall TheraMind, its officers, directors, employees,
              or affiliates be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to
              loss of profits, data, goodwill, or other intangible losses,
              arising out of or in connection with your access to, use of, or
              inability to use the Service, whether based on warranty, contract,
              tort (including negligence), or any other legal theory, even if
              TheraMind has been advised of the possibility of such damages.
            </p>
            <p>
              Your sole remedy for dissatisfaction with the Service is to stop
              using it. To the maximum extent permitted by law, our total
              liability to you for all claims arising from or relating to these
              Terms or your use of the Service is limited to the greater of (a)
              the total amount you have paid us in the twelve (12) months
              preceding the claim or (b) USD 100 if you have not paid anything
              for the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">"AS IS" Disclaimer</h3>
            <p>
              The Service is provided on an “AS IS” and “AS AVAILABLE” basis.
              TheraMind disclaims all warranties, express or implied, including
              but not limited to warranties of merchantability, fitness for a
              particular purpose, non-infringement, and availability. We do not
              warrant that the Service will be secure, error-free,
              uninterrupted, or that defects will be corrected.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Governing Law</h3>
            <p>
              These Terms and any dispute arising out of or related to these
              Terms or the Service shall be governed by the laws of Pakistan,
              without regard to its conflict of law provisions. You agree to
              submit to the exclusive jurisdiction of the courts located in
              Lahore, Pakistan, for any disputes arising from these Terms or
              your use of the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Dispute Resolution</h3>
            <p className="mb-4">
              Before pursuing any legal remedy, you and TheraMind agree to
              attempt to resolve any dispute amicably. If you have a dispute,
              please contact us at{" "}
              <a
                href="mailto:theramind2025@gmail.com"
                className="text-blue-600 hover:underline"
              >
                theramind2025@gmail.com
              </a>
              .
            </p>
            <p>
              If we cannot resolve the dispute within thirty (30) days after
              receiving written notice of your claim, either party may pursue
              any rights or remedies available under applicable law.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              Severability and Waiver
            </h3>
            <h4 className="text-lg font-medium mb-2">Severability</h4>
            <p className="mb-4">
              If any provision of these Terms is held to be invalid or
              unenforceable, the invalidity or unenforceability will not affect
              the remainder of these Terms, which will remain in full force and
              effect. The parties will negotiate in good faith to replace the
              invalid or unenforceable provision with a valid, enforceable
              provision that achieves, to the greatest extent possible, the
              original intent of the provision.
            </p>
            <h4 className="text-lg font-medium mb-2">Waiver</h4>
            <p>
              The failure of either party to enforce any right or provision of
              these Terms will not be deemed a waiver of such right or
              provision. Any waiver must be in writing and signed by the party
              granting the waiver.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">
              Changes to These Terms
            </h3>
            <p className="mb-4">
              We reserve the right to modify or replace these Terms at any time.
              If we make material changes, we will notify you at least 30 days
              prior to the changes taking effect by posting the updated Terms on
              the Service and updating the “Last updated” date. By continuing to
              use the Service after any changes become effective, you agree to
              be bound by the revised Terms. If you do not agree with the
              updated Terms, you must stop using the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="mt-2">
              By email:{" "}
              <a
                href="mailto:theramind2025@gmail.com"
                className="text-blue-600 hover:underline"
              >
                theramind2025@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
