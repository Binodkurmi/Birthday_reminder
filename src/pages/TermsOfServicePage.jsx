import React from 'react';
import { FaBalanceScale, FaExclamationTriangle, FaHandshake } from 'react-icons/fa';

function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaBalanceScale className="text-white text-2xl" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Please read these terms carefully before using our service</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="prose prose-amber max-w-none">
          {/* Important Notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Important Notice</h3>
                <p className="text-sm text-gray-700">
                  By using Birthday Reminder, you agree to these Terms of Service. 
                  If you do not agree, please discontinue use of our service.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Service Description */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">1. Service Description</h2>
              <p className="text-gray-700">
                Birthday Reminder is a service that helps you remember and track birthdays 
                of your friends, family, and colleagues. We provide notification services 
                and organization tools for birthday management.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">2. User Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must not use the service for any illegal purposes</li>
                <li>You must not attempt to gain unauthorized access to the service</li>
                <li>You are responsible for the accuracy of birthday information you add</li>
              </ul>
            </section>

            {/* Data Ownership */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">3. Data Ownership</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>You own your data.</strong> All birthday information and personal data 
                  you provide remains your property. We only store and process it to provide 
                  the Birthday Reminder service as outlined in our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Service Limitations */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">4. Service Limitations</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>We do not guarantee 100% uptime or notification delivery</li>
                <li>Service may be temporarily unavailable for maintenance</li>
                <li>We reserve the right to modify or discontinue the service</li>
                <li>Free users may have limitations on the number of birthdays they can add</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">5. Termination</h2>
              <p className="text-gray-700">
                You may terminate your account at any time through your account settings. 
                Upon termination, your data will be deleted as described in our Privacy Policy. 
                We reserve the right to terminate accounts that violate these terms.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">6. Limitation of Liability</h2>
              <p className="text-gray-700">
                Birthday Reminder is provided "as is" without warranties of any kind. 
                We are not liable for any missed birthdays, data loss, or damages arising 
                from use of our service.
              </p>
            </section>

            {/* Agreement */}
            <section className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-start">
                <FaHandshake className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Agreement</h3>
                  <p className="text-sm text-gray-700">
                    By continuing to use Birthday Reminder, you acknowledge that you have read, 
                    understood, and agree to be bound by these Terms of Service.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;