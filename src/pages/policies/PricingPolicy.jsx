import React from 'react';
import PolicyPage from '../../components/PolicyPage';

export default function PricingPolicy() {
  return (
    <PolicyPage title="Pricing Policy" lastUpdated="17-12-2025">
      
      {/* 1. Purpose */}
      <div className="text-gray-600 text-lg leading-relaxed border-l-4 border-[#0b3b5e] pl-4 italic mb-10">
        <p>
          The Pricing Policy aims to outline how <span className="font-semibold text-gray-900">Inklidox Technologies</span> determines, updates, and applies pricing for its software development, IT services, and digital products. This ensures transparency and consistency in how customers are charged.
        </p>
      </div>

      {/* 2. Pricing Structure */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">2. Pricing Structure & Determinants</h3>
        <p className="text-gray-700 mb-4">
          Pricing at Inklidox Technologies is based on several key factors. Prices displayed on our website or in quotations serve as estimates and may vary depending on specific project needs.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-[#0b3b5e] mb-2">Project-Based Factors</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>Project complexity & development time</li>
                    <li>Technology stack & modules</li>
                    <li>Customized features</li>
                    <li>Third-party integration requirements</li>
                    <li>Ongoing support needs</li>
                </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-[#0b3b5e] mb-2">Subscription Factors</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    <li>User count</li>
                    <li>Storage capacity</li>
                    <li>Hosting resources</li>
                    <li>Service tiers</li>
                </ul>
            </div>
        </div>
      </section>

      {/* 3. Taxes & Additional Charges */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">3. Taxes & Additional Charges</h3>
        <p className="text-gray-700 mb-4">
          All prices are <span className="font-bold">exclusive of GST</span> unless mentioned otherwise. Additional charges will be communicated before project initiation or activation.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <p className="font-bold text-gray-800 mb-2">Potential Additional Charges:</p>
            <div className="flex flex-wrap gap-2">
                <span className="bg-white px-3 py-1 rounded border border-gray-300 text-sm text-gray-600">Cloud hosting fees</span>
                <span className="bg-white px-3 py-1 rounded border border-gray-300 text-sm text-gray-600">Domain charges</span>
                <span className="bg-white px-3 py-1 rounded border border-gray-300 text-sm text-gray-600">SMS/Email gateway charges</span>
                <span className="bg-white px-3 py-1 rounded border border-gray-300 text-sm text-gray-600">API usage fees</span>
                <span className="bg-white px-3 py-1 rounded border border-gray-300 text-sm text-gray-600">Plugin/Module costs</span>
            </div>
        </div>
      </section>

      {/* 4. Price Revisions */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">4. Price Revisions & Modifications</h3>
        <p className="text-gray-700 mb-3">
          Inklidox Technologies reserves the right to revise service prices at any time.
        </p>
        <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span><strong>Ongoing Projects:</strong> Price changes will <span className="underline">not</span> affect projects covered under a signed contract or valid quotation period.</span>
            </li>
            <li className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span><strong>New Applicability:</strong> Revisions apply to new orders, renewals, change requests, or additional features beyond the original scope.</span>
            </li>
        </ul>
      </section>

      {/* 5. Pricing Accuracy */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">5. Pricing Accuracy</h3>
        <p className="text-gray-700 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
          Although we strive for accuracy, errors may occur. In the event of incorrect pricing, Inklidox Technologies reserves the right to adjust or correct the price. If an order was placed based on an incorrect price, we may cancel the order and issue a refund, ensuring prompt notification.
        </p>
      </section>

      {/* 6. Payment Terms */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">6. Payment Terms</h3>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-5 rounded-lg">
                <h5 className="font-bold text-gray-800 mb-2">Project-Based Services</h5>
                <p className="text-gray-600 text-sm">Require advance payments ranging from <span className="font-bold">50% to 80%</span> depending on complexity and resource needs.</p>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg">
                <h5 className="font-bold text-gray-800 mb-2">Subscription Services</h5>
                <p className="text-gray-600 text-sm">Require <span className="font-bold">full payment upfront</span> for activation.</p>
            </div>
        </div>
        <p className="text-gray-600 text-sm mt-4 italic">
            * Additional work or change requests introduced after project commencement will be billed separately and must be paid before execution.
        </p>
      </section>

      {/* 7. Third-Party Pricing */}
      <section className="mb-10">
         <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">7. Third-Party Pricing Impact</h3>
         <p className="text-gray-700">
            When services rely on third-party providers (hosting, cloud platforms, APIs), fluctuations in their pricing may affect customer charges. Any such changes will be communicated to customers in advance whenever possible.
         </p>
      </section>

      {/* 8. BO Clause */}
      <section className="mb-10">
         <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">8. BO Clause (Bank Obligation)</h3>
         <p className="text-gray-700 text-sm">
            As per payment gateway compliance, Inklidox Technologies is not responsible for transaction failures resulting from the cardholder exceeding preset limits set by their issuing bank. This clause applies to all transactions processed through the Worldline Payment Gateway.
         </p>
      </section>

      {/* 9. Legal Jurisdiction */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">9. Legal Jurisdiction</h3>
        <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg text-gray-700">
            <svg className="w-6 h-6 text-[#0b3b5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            <p>
                All matters related to pricing disputes will be governed under the laws of <span className="font-bold text-gray-900">India</span>, with exclusive jurisdiction in the courts of <span className="font-bold text-gray-900">Coimbatore, Tamil Nadu</span>.
            </p>
        </div>
      </section>

    </PolicyPage>
  );
}
