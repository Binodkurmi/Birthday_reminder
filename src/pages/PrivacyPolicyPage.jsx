import React from 'react';
import { FaShieldAlt, FaLock, FaUserSecret, FaDatabase, FaEyeSlash } from 'react-icons/fa';

function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaShieldAlt className="text-white text-2xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">How we protect and handle your personal information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="prose prose-blue max-w-none">
          <div className="mb-8 p-4 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <FaLock className="mr-2 text-blue-500" />
              Our Commitment to Privacy
            </h2>
            <p className="text-gray-700">
              Your privacy is our top priority. We are committed to protecting your personal information
              and being transparent about how we collect, use, and protect it.
            </p>
          </div>

          <div className="space-y-8">
            {/* Data Collection */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaDatabase className="mr-2 text-green-500" />
                What Information We Collect
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> Your name, email address, and password (encrypted)</li>
                <li><strong>Birthday Data:</strong> Names, dates, relationships, and optional notes about birthdays</li>
                <li><strong>Usage Data:</strong> How you interact with our service to improve user experience</li>
                <li><strong>Device Information:</strong> Browser type, IP address (anonymized), and device type</li>
              </ul>
            </section>

            {/* Data Usage */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaUserSecret className="mr-2 text-purple-500" />
                How We Use Your Information
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>To provide and maintain the Birthday Reminder service</li>
                <li>To send birthday notifications and reminders</li>
                <li>To improve our service based on user feedback</li>
                <li>To ensure security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaShieldAlt className="mr-2 text-amber-500" />
                How We Protect Your Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Encryption</h4>
                  <p className="text-sm text-gray-600">
                    All data is encrypted using AES-256 encryption both in transit (HTTPS/TLS) and at rest.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Access Control</h4>
                  <p className="text-sm text-gray-600">
                    Strict access controls ensure only authorized personnel can access your data.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Regular Audits</h4>
                  <p className="text-sm text-gray-600">
                    Security audits and vulnerability assessments are conducted regularly.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Data Minimization</h4>
                  <p className="text-sm text-gray-600">
                    We only collect data necessary for providing our service.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaEyeSlash className="mr-2 text-red-500" />
                We DO NOT Share Your Data
              </h3>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-gray-700 font-medium">
                  We never sell, rent, or trade your personal information to third parties.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Your birthday data and personal information remain confidential and are only used 
                  to provide the Birthday Reminder service.
                </p>
              </div>
            </section>

            {/* User Rights */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Rights</h3>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <ul className="space-y-2 text-gray-700">
                  <li>✅ <strong>Right to Access:</strong> View all data we have about you</li>
                  <li>✅ <strong>Right to Correction:</strong> Update or correct your information</li>
                  <li>✅ <strong>Right to Deletion:</strong> Request deletion of your account and data</li>
                  <li>✅ <strong>Right to Export:</strong> Download your data in a portable format</li>
                  <li>✅ <strong>Right to Object:</strong> Opt-out of certain data processing</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h3>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or wish to exercise your rights, 
                please contact our Data Protection Officer at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@birthdayreminder.com<br />
                <strong>Response Time:</strong> Within 30 days
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;