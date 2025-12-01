// frontend/src/pages/TermsAndConditions.tsx
import { Shield, AlertCircle, Scale, Mail, Globe } from 'lucide-react';

export default function TermsAndConditions() {
    const lastUpdated = "November 30, 2025";
    const websiteName = "Mouse Days";
    const contactEmail = "contact@mousedays.com";
    const websiteUrl = "https://yourdomain.com";

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-2">
                        Terms & Conditions
                    </h1>
                    <p className="text-gray-600">Last Updated: {lastUpdated}</p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8">

                    {/* Important Notice */}
                    <div className="rounded-xl p-6 mb-8 bg-[var(--sunset)]">
                        <div className="flex gap-3">
                            <AlertCircle className="w-6 h-6 flex-shrink-0 text-[var(--rose)]" />
                            <div>
                                <h3 className="font-bold mb-2">Please Read Carefully</h3>
                                <p className="text-sm">
                                    By accessing or using Mouse Days (“we,” “us,” “our”), you agree to these Terms & Conditions (“Terms”). If you do not agree, please discontinue use of the Website.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4" >1. About Mouse Days</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Welcome to {websiteName} ("we," "us," or "our"). Mouse Days is an independent recommendation engine tool designed to help
                            users research and compare Walt Disney World Resort hotels and related options.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            These Terms & Conditions ("Terms") govern your access to and use of MouseDays.com and any
                            related tools, content, or services we provide (collectively, the "Website").
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4" >2. Eligibility</h2>
                        <p className="text-gray-700 leading-relaxed">
                            You must be at least 18 years old to use this Website. By using the Website, you represent
                            and warrant that you meet this age requirement and have the legal capacity to enter into
                            these Terms.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Changes to These Terms</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to modify these Terms at any time. The “Last Updated” date will reflect the most recent changes.
                            Continued use of the Website constitutes acceptance of the updated Terms.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            We encourage you to review these Terms periodically to stay informed of any updates.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Not Affiliated With Disney</h2>
                        <p className="font-semibold mb-2">
                            Important Disclaimer:
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Mouse Days is an independent project and is <strong>not affiliated with, endorsed by,
                                or officially connected to</strong> The Walt Disney Company, Walt Disney World Resort,
                            Disneyland Resort, any Disney-owned entity, or any Disney subsidiary or affiliate.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            All Disney-related names, trademarks, service marks, characters, attractions, hotel names,
                            and properties are the exclusive property of Disney Enterprises, Inc. and its affiliates.
                            Any references to these trademarks are for informational and identification purposes only
                            and do not imply any affiliation or endorsement.
                        </p>

                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Website Use & Access</h2>

                        <div className="rounded-xl mb-6">
                            <h3 className="font-bold mb-3">Permitted Use</h3>
                            <p className="text-gray-700 leading-relaxed">
                                You may use the Website for personal, non-commercial purposes only.
                            </p>
                        </div>

                        <h3 className="font-bold mb-3">Prohibited Activities</h3>
                        <p className="text-gray-700 mb-2">You agree not to:</p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Copy, reproduce, distribute, or modify Website content without permission</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Scrape, mine, or use automated tools to extract data from the Website</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Republish or resell any part of the Website or its content</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Attempt to gain unauthorized access to any systems or networks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Interfere with or disrupt the Website's functionality or servers</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Use the Website for any illegal, unlawful, or unauthorized purpose</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Upload viruses, malware, any harmful code, or disruptive content</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Intellectual Property Rights</h2>
                        <p className="text-gray-700 leading-relaxed">
                            All content on Mouse Days - including but not limited to text, graphics, data compilations,
                            logos, user interface design, code, algorithms, and website functionality - is owned by
                            Mouse Days or licensed to us and is protected by copyright, trademark, and other
                            intellectual property laws.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            Your use of the Website does not grant you any ownership rights or licenses except as
                            explicitly stated in these Terms.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Information Accuracy & Disclaimers</h2>

                        <div className="rounded-xl mb-4">
                            <h3 className="font-bold mb-3">General Information Only</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Mouse Days provides general information, recommendations, and research tools. All information is provided for
                                informational purposes only and should not be considered professional travel advice.
                            </p>
                        </div>

                        <div className="rounded-xl mb-4">
                            <h3 className="font-bold mb-3">No Guarantees</h3>
                            <p className="text-gray-700 mb-2">We do not guarantee:</p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">•</span>
                                    <span>The accuracy, completeness, or reliability of hotel information, pricing, or availability</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">•</span>
                                    <span>The accuracy, completeness, or reliability of crowd predictions or park recommendations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">•</span>
                                    <span>That recommendations will meet your specific needs or expectations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">•</span>
                                    <span>The performance or availability of Disney parks, hotels, or services</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">•</span>
                                    <span>That third-party data (including hotel features, transportation options, or amenities) is current</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">•</span>
                                    <span>That the Website will be error-free or uninterrupted</span>
                                </li>
                            </ul>
                        </div>

                        <p className="text-back font-semibold">
                            User Responsibility: Use of the Website is at your own discretion and risk. You should verify all details directly with official Disney sources or your travel provider.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">8. No Booking Services</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Mouse Days does not process reservations, handle payments, or facilitate hotel bookings.
                            All reservations and bookings must be made directly through official Disney channels or authorized travel agents.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            We are not responsible for any issues related to bookings, cancellations, pricing changes, third-party disputes,
                            or availability with Disney or any third-party service provider.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">9. Third-Party Websites</h2>
                        <p className="text-gray-700 leading-relaxed">
                            The Website may contain links to third-party websites, services, or resources. We do not control, endorse, or assume responsibility
                            for any third-party sites, content, privacy policies, or practices.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            Access and use third-party sites at your own risk. Review the terms
                            and privacy policies of any sites you visit.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">10. Website Availability & Modifications</h2>
                        <p className="text-gray-700 leading-relaxed">
                            We reserve the right to modify, suspend, or discontinue any part of the Website at any time,
                            with or without notice. We may also update features, change algorithms, or alter the user
                            experience as we see fit.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            We are not liable for any downtime, data loss, service interruptions, or changes to the
                            Website that may affect your use or saved preferences.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">11. Disclaimer of Warranties</h2>
                        <p className="font-bold mb-3">
                            THE WEBSITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES
                            OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT
                            LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                            NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">12. Limitation of Liability</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOUSE DAYS, ITS OWNERS, OPERATORS, EMPLOYEES, AND
                            AFFILIATES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                            OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO:
                        </p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Your use of or inability to use the Website</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Any reliance on information provided through the Website</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Errors, omissions, or inaccuracies in content</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Loss of data, profits, bookings, or travel plans</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Service interruptions or technical failures</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Unauthorized access to your device or data</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Loss of data, profits, or travel opportunities</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Third-party services, links, or websites</span>
                            </li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            This applies even if we were advised such damages could occur.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">13. Indemnification</h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            You agree to indemnify, defend, and hold harmless Mouse Days and its owners, operators,
                            employees, and affiliates from and against any claims, liabilities, damages, losses, costs,
                            or expenses (including reasonable attorney's fees) arising from:
                        </p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Your violation of these Terms</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Your use or misuse of the Website</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Your violation of any third-party rights</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold">•</span>
                                <span>Any content you submit or transmit through the Website</span>
                            </li>
                        </ul>
                    </section>

                    {/* Section 14 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">14. Governing Law & Dispute Resolution</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms are governed by and construed in accordance with the laws of the State of Georgia,
                            United States, without regard to its conflict of law principles.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            Any disputes, claims, or controversies arising out of or relating to these Terms or your use
                            of the Website shall be resolved exclusively in the state or federal courts located in Georgia.
                            You consent to the personal jurisdiction of such courts.
                        </p>
                    </section>

                    {/* Section 15 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">15. Severability</h2>
                        <p className="text-gray-700 leading-relaxed">
                            If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court
                            of competent jurisdiction, the remaining provisions shall continue in full force and effect.
                        </p>
                    </section>

                    {/* Section 16 */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">16. Entire Agreement</h2>
                        <p className="text-gray-700 leading-relaxed">
                            These Terms, together with our Privacy Policy, constitute the entire agreement between you
                            and Mouse Days regarding your use of the Website and supersede all prior agreements,
                            understandings, or communications.
                        </p>
                    </section>

                    {/* Contact Section */}
                    <section className="bg-[var(--lpink)] rounded-2xl p-8 mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">17. Contact Us</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            If you have any questions about these Terms & Conditions, please contact us at:
                        </p>
                        <div className="space-y-2">
                            <p className="text-gray-800 font-semibold flex items-center gap-2">
                                <Mail className="w-5 h-5 text-purple-600" />
                                <a href={`mailto:${contactEmail}`} className="hover:underline">{contactEmail}</a>
                            </p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-600 text-sm">
                    <div className="flex items-center justify-center gap-2">
                        <p>
                            By using Mouse Days, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
                        </p>
                    </div>
                    <p className="mt-2">This policy is effective as of {lastUpdated}</p>
                </div>
            </div>
        </div>
    );
}