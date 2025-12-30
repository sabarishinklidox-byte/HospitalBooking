import React from 'react';
import PolicyPage from '../../components/PolicyPage';

export default function CancellationPolicy() {
  return (
    <PolicyPage title="Cancellation Policy" lastUpdated="17-12-2025">
      
      {/* 1. Policy Overview */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">1. Policy Overview</h3>
        <p className="text-gray-700 leading-relaxed">
          This Cancellation Policy is designed to help customers understand how to cancel orders or service requests made with <span className="font-semibold text-gray-900">Inklidox Technologies Private Limited</span>. It outlines the timelines, rules, and limitations associated with cancellations to ensure fairness and clarity across all our business transactions.
        </p>
      </section>

      {/* 2. General Cancellation Terms */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">2. General Cancellation Terms</h3>
        <div className="bg-blue-50 border-l-4 border-[#0b3b5e] p-6 rounded-r-lg">
          <p className="text-gray-800">
            A customer may request cancellation within <span className="font-bold text-[#0b3b5e]">72 hours</span> of placing an order, provided that work on the project has not started.
          </p>
          <p className="text-gray-700 mt-2 text-sm">
            Once project execution, resource allocation, requirement gathering, or any part of the development has begun, cancellation will not be allowed. This ensures that invested time, cost, and resource planning are protected.
          </p>
        </div>
      </section>

      {/* 3. Non-Cancellable Items */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">3. Non-Cancellable Items</h3>
        <p className="text-gray-700 mb-4">
          Some categories of services cannot be cancelled under any circumstances. These include:
        </p>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
            <li className="flex items-start">
               <svg className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               <span>Custom software development after initiation</span>
            </li>
            <li className="flex items-start">
               <svg className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               <span>Express or urgent service requests</span>
            </li>
            <li className="flex items-start">
               <svg className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               <span>Subscription services post-activation</span>
            </li>
            <li className="flex items-start">
               <svg className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               <span>Discounted or promotional packages</span>
            </li>
            <li className="flex items-start">
               <svg className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               <span>Digital modules & Third-party licenses</span>
            </li>
            <li className="flex items-start">
               <svg className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               <span>Hosting packages & sourced deliverables</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 4. Incorrect or Unmatched Deliverables */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">4. Incorrect or Unmatched Deliverables</h3>
        <p className="text-gray-700 mb-3">
          If a customer receives a deliverable that does not align with the agreed specifications, they must inform Inklidox Technologies within <span className="font-bold text-gray-900">24 hours</span> of receipt.
        </p>
        <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm">
          <strong>Note:</strong> Our team will review the concern and take corrective steps. If the issue can be reasonably rectified, cancellation will not be granted. Cancellation is considered only if the issue is substantial and cannot be resolved.
        </p>
      </section>

      {/* 5. Cancellation Request Submission */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">5. How to Request Cancellation</h3>
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-4">Cancellation requests must be submitted via email.</p>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <h5 className="font-bold text-gray-800 mb-2">Required Information:</h5>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                        <li>Customer's Name</li>
                        <li>Contact Details</li>
                        <li>Order or Invoice Number</li>
                        <li>Reason for Cancellation</li>
                    </ul>
                </div>
                <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                    <h5 className="font-bold text-gray-800 mb-2">Send Request To:</h5>
                    <a href="mailto:info@inklidox.com" className="text-[#0b3b5e] font-medium hover:underline block mb-2">info@inklidox.com</a>
                    <p className="text-xs text-gray-500">
                        Our team will acknowledge and process the request within <span className="font-bold">3–5 business days</span> after evaluating its validity under this policy.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 6. Cancellations Initiated by Inklidox */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">6. Cancellations Initiated by Us</h3>
        <p className="text-gray-700 mb-3">Inklidox Technologies may cancel an order due to:</p>
        <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
            <li>Incomplete customer information</li>
            <li>Inability to deliver service due to technical limitations</li>
            <li>Suspected fraudulent activities</li>
            <li>Non-payment</li>
        </ul>
        <p className="text-gray-600 text-sm italic">
            In such cases, the customer will be notified, and eligible refunds will be processed in accordance with the Refund Policy.
        </p>
      </section>

      {/* 7. Legal Jurisdiction */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">7. Legal Jurisdiction</h3>
        <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg text-gray-700">
            <svg className="w-6 h-6 text-[#0b3b5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            <p>
                All cancellation-related matters will be governed under Indian law, with exclusive legal jurisdiction in the courts of <span className="font-bold text-gray-900">Coimbatore, Tamil Nadu</span>.
            </p>
        </div>
      </section>

    </PolicyPage>
  );
}
