import React from 'react';
import PolicyPage from '../../components/PolicyPage';

export default function PrivacyPolicy() {
  return (
    <PolicyPage title="Privacy Policy" lastUpdated="17-12-2025">
      
      {/* Introduction */}
      <div className="text-gray-600 text-lg leading-relaxed border-l-4 border-[#0b3b5e] pl-4 italic mb-10">
        <p>
          This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
        </p>
        <p className="mt-2 text-sm">
          We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
        </p>
      </div>

      {/* Section 1: Interpretation and Definitions */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-6 border-b border-gray-200 pb-2">1. Interpretation and Definitions</h3>
        
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-3">Interpretation</h4>
          <p className="text-gray-600 mb-4">
            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4">Definitions</h4>
          <p className="text-gray-600 mb-4">For the purposes of this Privacy Policy:</p>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Account:</strong> Means a unique account created for You to access our Service or parts of our Service.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Affiliate:</strong> Means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Company:</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to <span className="font-semibold text-gray-900">Inklidox Technologies Pvt., Ltd.</span>, No. 198, 2nd Floor, VKV Complex, Nehru Street, Ram Nagar, Gandhipuram, Coimbatore - 641009, Tamil Nadu, South India.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Cookies:</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Country:</strong> refers to Tamil Nadu, India.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Device:</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Personal Data:</strong> Is any information that relates to an identified or identifiable individual.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Service:</strong> refers to the Website.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Service Provider:</strong> Means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Usage Data:</strong> Refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>Website:</strong> Refers to Inklidox Technologies, accessible from <a href="https://www.inklidox.com/" className="text-[#0b3b5e] hover:underline">https://www.inklidox.com/</a></span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 mt-2 mr-3 bg-[#0b3b5e] rounded-full flex-shrink-0"></span>
                <span><strong>You:</strong> Means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Collecting Data */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-6 border-b border-gray-200 pb-2">2. Collecting and Using Your Personal Data</h3>
        
        <div className="space-y-6 text-gray-700">
            <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Types of Data Collected</h4>
                <p className="font-semibold mb-2">Personal Data</p>
                <p className="mb-3">While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
                <ul className="list-disc pl-5 space-y-1 ml-4 text-gray-600">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Phone number</li>
                    <li>Usage Data</li>
                </ul>
            </div>

            <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Usage Data</h4>
                <p className="mb-2">Usage Data is collected automatically when using the Service.</p>
                <p className="mb-2">Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
                <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
            </div>
        </div>
      </section>

      {/* Section 3: Tracking & Cookies */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-6 border-b border-gray-200 pb-2">3. Tracking Technologies & Cookies</h3>
        <p className="text-gray-700 mb-4">
            We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-gray-900 mb-2">Cookies or Browser Cookies</h5>
                <p className="text-sm text-gray-600">A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-gray-900 mb-2">Web Beacons</h5>
                <p className="text-sm text-gray-600">Small electronic files (clear gifs, pixel tags) that permit the Company to count users who have visited pages or opened an email and for other related website statistics.</p>
            </div>
        </div>

        <p className="text-gray-700 mb-4">We use both Session and Persistent Cookies for the purposes set out below:</p>
        
        <div className="space-y-4">
            <div className="border-l-4 border-blue-200 pl-4 py-2">
                <p className="font-bold text-gray-800">Necessary / Essential Cookies</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Type: Session Cookies | Administered by: Us</p>
                <p className="text-sm text-gray-600 mt-1">These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features.</p>
            </div>
            <div className="border-l-4 border-blue-200 pl-4 py-2">
                <p className="font-bold text-gray-800">Cookies Policy / Notice Acceptance Cookies</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Type: Persistent Cookies | Administered by: Us</p>
                <p className="text-sm text-gray-600 mt-1">These Cookies identify if users have accepted the use of cookies on the Website.</p>
            </div>
             <div className="border-l-4 border-blue-200 pl-4 py-2">
                <p className="font-bold text-gray-800">Functionality Cookies</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Type: Persistent Cookies | Administered by: Us</p>
                <p className="text-sm text-gray-600 mt-1">These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference.</p>
            </div>
        </div>
      </section>

      {/* Section 4: Use of Your Personal Data */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-6 border-b border-gray-200 pb-2">4. Use of Your Personal Data</h3>
        <p className="text-gray-700 mb-4">The Company may use Personal Data for the following purposes:</p>
        <ul className="space-y-3 text-gray-700 list-disc pl-5">
            <li><strong>To provide and maintain our Service:</strong> including to monitor the usage of our Service.</li>
            <li><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service.</li>
            <li><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased.</li>
            <li><strong>To contact You:</strong> by email, telephone calls, SMS, or other equivalent forms of electronic communication.</li>
            <li><strong>To provide You with news:</strong> special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased.</li>
            <li><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</li>
            <li><strong>For business transfers:</strong> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale.</li>
            <li><strong>For other purposes:</strong> such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service.</li>
        </ul>
        
        <p className="text-gray-700 mt-6 mb-4">We may share Your personal information in the following situations:</p>
        <ul className="space-y-3 text-gray-700 list-disc pl-5">
             <li><strong>With Service Providers:</strong> to monitor and analyze the use of our Service, to contact You.</li>
             <li><strong>For business transfers:</strong> in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition.</li>
             <li><strong>With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</li>
             <li><strong>With business partners:</strong> to offer You certain products, services or promotions.</li>
             <li><strong>With other users:</strong> when You share personal information or otherwise interact in the public areas with other users.</li>
             <li><strong>With Your consent:</strong> We may disclose Your personal information for any other purpose with Your consent.</li>
        </ul>
      </section>

      {/* Section 5: Retention & Transfer */}
      <section className="mb-12">
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-bold text-[#0b3b5e] mb-4">5. Retention of Data</h3>
                <p className="text-gray-700 text-sm mb-3">The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
                <p className="text-gray-700 text-sm">The Company will also retain Usage Data for internal analysis purposes, generally for a shorter period of time, except when used to strengthen security or improve functionality.</p>
            </div>
            <div>
                <h3 className="text-xl font-bold text-[#0b3b5e] mb-4">6. Transfer of Data</h3>
                <p className="text-gray-700 text-sm mb-3">Your information is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It may be transferred to computers located outside of Your jurisdiction.</p>
                <p className="text-gray-700 text-sm">The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place.</p>
            </div>
        </div>
      </section>

       {/* Section 6: Delete Data */}
       <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-4 border-b border-gray-200 pb-2">7. Delete Your Personal Data</h3>
        <p className="text-gray-700 mb-3">You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
        <p className="text-gray-700 mb-3">Our Service may give You the ability to delete certain information about You from within the Service. You may update, amend, or delete Your information at any time by signing in to Your Account and visiting the account settings section.</p>
        <p className="text-gray-700 italic">Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.</p>
      </section>

      {/* Section 7: Disclosure */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-6 border-b border-gray-200 pb-2">8. Disclosure of Your Personal Data</h3>
        
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-gray-800 mb-2">Business Transactions</h4>
                <p className="text-gray-700 text-sm">If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 mb-2">Law enforcement</h4>
                <p className="text-gray-700 text-sm">Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 mb-2">Other legal requirements</h4>
                <p className="text-gray-700 text-sm mb-2">The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                    <li>Comply with a legal obligation</li>
                    <li>Protect and defend the rights or property of the Company</li>
                    <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                    <li>Protect the personal safety of Users of the Service or the public</li>
                    <li>Protect against legal liability</li>
                </ul>
            </div>
        </div>
      </section>

      {/* Section 8: Security & Children */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-6 border-b border-gray-200 pb-2">9. Security & Children's Privacy</h3>
        <div className="space-y-6">
            <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-bold text-yellow-800 mb-2">Security of Your Personal Data</h4>
                <p className="text-yellow-900 text-sm">The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
            </div>
            <div>
                 <h4 className="font-bold text-gray-800 mb-2">Children's Privacy</h4>
                 <p className="text-gray-700 text-sm mb-2">Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us.</p>
                 <p className="text-gray-700 text-sm">If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.</p>
            </div>
        </div>
      </section>

      {/* Section 9: Links & Changes */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-6 border-b border-gray-200 pb-2">10. External Links & Changes</h3>
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h4 className="font-bold text-gray-800 mb-2">Links to Other Websites</h4>
                <p className="text-gray-700 text-sm">Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 mb-2">Changes to this Privacy Policy</h4>
                <p className="text-gray-700 text-sm mb-2">We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
                <p className="text-gray-700 text-sm">You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-8 mt-12 text-center">
        <h3 className="text-2xl font-bold text-[#0b3b5e] mb-2">Contact Us</h3>
        <p className="text-gray-600 mb-6">If you have any questions about this Privacy Policy, You can contact us:</p>
        
        <div className="flex justify-center">
          <div className="flex items-center justify-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm">
            <svg className="w-5 h-5 text-[#0b3b5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            <a href="mailto:info@inklidox.com" className="text-gray-800 font-medium hover:text-[#0b3b5e] transition-colors">info@inklidox.com</a>
          </div>
        </div>
      </div>

    </PolicyPage>
  );
}
