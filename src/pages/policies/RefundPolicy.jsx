import React from 'react';
import PolicyPage from '../../components/PolicyPage';

export default function RefundPolicy() {
  return (
    <PolicyPage title="Refund Policy" lastUpdated="17-12-2025">
      
      {/* 1. Introduction */}
      <div className="text-gray-600 text-lg leading-relaxed border-l-4 border-[#0b3b5e] pl-4 italic mb-10">
        <p>
          <span className="font-semibold text-gray-900">Inklidox Technologies Private Limited</span> is committed to ensuring customer satisfaction with all software development, IT services, and digital solutions offered. Our Refund Policy outlines the conditions under which refunds may be issued and the procedures customers must follow to initiate a request.
        </p>
      </div>

      {/* 2. Eligibility for Refunds */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">2. Eligibility for Refunds</h3>
        <p className="text-gray-700 mb-4">
          Refunds are considered only in specific situations. Eligibility is assessed on a case-by-case basis after reviewing the nature of the project and the progress of work completed.
        </p>
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <h4 className="font-bold text-green-800 mb-3">Conditions for Refund:</h4>
          <ul className="space-y-3 text-green-900">
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>The purchased service has not been initiated.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Inklidox Technologies is unable to deliver the agreed scope of work.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>The delivered output significantly deviates from documented project requirements and cannot be reasonably corrected by our technical team.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 3. Non-Refundable Services */}
      <section className="mb-10">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">3. Non-Refundable Services</h3>
        <p className="text-gray-700 mb-4">Certain services and products are strictly non-refundable:</p>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
           <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
              <li className="flex items-start">
                 <span className="text-red-500 mr-2">●</span> Software development work after project initiation
              </li>
              <li className="flex items-start">
                 <span className="text-red-500 mr-2">●</span> Customized solutions with invested effort/resources
              </li>
              <li className="flex items-start">
                 <span className="text-red-500 mr-2">●</span> Subscription-based services once activated
              </li>
              <li className="flex items-start">
                 <span className="text-red-500 mr-2">●</span> Digital deliverables accessed or downloaded
              </li>
              <li className="flex items-start">
                 <span className="text-red-500 mr-2">●</span> Third-party tools, licenses, or cloud resources
              </li>
              <li className="flex items-start">
                 <span className="text-red-500 mr-2">●</span> Delivered training, consultations, & onboarding
              </li>
           </ul>
        </div>
      </section>

      {/* 4. Refund Request Process & 5. Timeline */}
      <section className="mb-10 grid md:grid-cols-2 gap-8">
         {/* Request Process */}
         <div>
            <h3 className="text-xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">4. Request Process</h3>
            <p className="text-gray-700 mb-4 text-sm">Customers who seek a refund must submit a written request including full name, contact details, invoice number, and explanation.</p>
            <div className="bg-blue-50 p-4 rounded-lg">
               <p className="text-xs font-bold text-gray-500 uppercase mb-1">Send Request To</p>
               <a href="mailto:info@inklidox.com" className="text-[#0b3b5e] font-bold hover:underline">info@inklidox.com</a>
               <p className="text-xs text-gray-500 mt-2">Requests are reviewed within 7 business days.</p>
            </div>
         </div>

         {/* Timeline */}
         <div>
            <h3 className="text-xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">5. Processing Timeline</h3>
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-gray-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-[#0b3b5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <div>
                  <p className="font-bold text-gray-900 text-lg">7 to 21 Business Days</p>
                  <p className="text-xs text-gray-500">Dependent on banking procedures</p>
               </div>
            </div>
            <p className="text-gray-700 text-sm">
               Refunds are credited to the original payment method. We are not responsible for delays caused by financial intermediaries.
            </p>
         </div>
      </section>

      {/* 6. Special Conditions */}
      <section className="mb-10">
         <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">6. Special Conditions & Limitations</h3>
         <div className="space-y-4 text-gray-700">
            <p>Refunds will <strong>not</strong> be issued in cases of customer negligence, delays caused by the customer’s unavailability, or changes in project scope after commencement.</p>
            <p className="bg-yellow-50 p-4 border-l-4 border-yellow-400 text-sm">
               <strong>Important:</strong> If a customer initiates a bank dispute without contacting Inklidox Technologies, the refund process may be temporarily halted until verification is completed. Refund decisions made by Inklidox Technologies are final.
            </p>
         </div>
      </section>

      {/* 7. BO Clause */}
      <section className="mb-10">
         <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">7. BO Clause (Bank Obligation)</h3>
         <p className="text-gray-700">
            In accordance with our payment gateway terms, Inklidox Technologies bears no liability for losses arising from transaction decline due to the cardholder exceeding pre-set limits agreed upon with their issuing bank. This is a standard regulatory requirement applicable to all digital payments.
         </p>
      </section>

      {/* 8. Legal Jurisdiction */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">8. Legal Jurisdiction</h3>
        <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg text-gray-700">
            <svg className="w-6 h-6 text-[#0b3b5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            <p>
                All disputes and issues related to refunds will be governed under the laws of India. Any legal proceedings shall fall under the jurisdiction of courts located in <span className="font-bold text-gray-900">Coimbatore, Tamil Nadu</span>.
            </p>
        </div>
      </section>

    </PolicyPage>
  );
}
