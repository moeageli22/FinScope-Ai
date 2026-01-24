import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            console.log('Starting PDF download...');

            // Fetch the PDF from your backend API
            const response = await fetch('http://localhost:5173/api/download-terms', {
                method: 'GET',
                headers: {
                    'Accept': 'application/pdf',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response content-type:', response.headers.get('content-type'));

            // Check if response is an error (will be JSON)
            const contentType = response.headers.get('content-type');

            if (!response.ok) {
                // If it's an error, try to parse JSON
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    console.error('Server error:', errorData);
                    throw new Error(errorData.message || 'Failed to download PDF');
                } else {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }
            }

            // Check if we actually got a PDF
            if (!contentType || !contentType.includes('application/pdf')) {
                throw new Error(`Expected PDF but got ${contentType}`);
            }

            // Convert response to blob
            const blob = await response.blob();
            console.log('Blob size:', blob.size, 'bytes');
            console.log('Blob type:', blob.type);

            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'FinScopeAITerms.pdf';
            link.style.display = 'none';
            document.body.appendChild(link);

            console.log('✅ Triggering download...');
            link.click();

            // Cleanup after a short delay
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                console.log('✅ Download cleanup complete');
            }, 100);

            console.log('✅ PDF downloaded successfully!');

        } catch (error) {
            console.error('❌ Download error:', error);
            alert(`Failed to download PDF: ${error.message}\n\nPlease check the console for more details.`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="terms-page">
            {/* Back Button */}
            <button className="terms-back-button" onClick={() => navigate('/')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Home
            </button>

            <div className="terms-container">
                {/* Header */}
                <div className="terms-header">
                    <div className="terms-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                        <span>Legal Documents</span>
                    </div>

                    <h1>
                        Terms & Conditions and <span className="gradient-text">Privacy Policy</span>
                    </h1>

                    <p>
                        Please read these terms carefully before using FinScope AI.<br />
                        Last updated: January 2025
                    </p>

                    <button
                        className="download-button"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {downloading ? 'Downloading...' : 'Download Terms & Conditions (PDF)'}
                    </button>
                </div>

                {/* Content Card */}
                <div className="terms-content-card">

                    {/* Student Project Disclaimer */}
                    <div className="terms-section">
                        <h2>Student Project Disclaimer</h2>
                        <div className="terms-warning">
                            <p>
                                <strong>⚠️ Important Notice:</strong> FinScope AI is a student research project developed solely for academic and educational purposes. It is not a real financial service and does not provide banking, investment, or payment services.
                            </p>
                        </div>
                        <p>
                            Users are strongly advised not to submit real banking credentials, card numbers, national identification details, or any highly sensitive personal data. All financial data used on the platform should be fictional, simulated, or strictly for demonstration purposes.
                        </p>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="terms-section">
                        <h2>Terms & Conditions</h2>
                        <p>
                            By accessing or using FinScope AI, users agree to comply with all applicable laws and with these Terms and Conditions. The platform must not be used for illegal activities, abuse, reverse engineering, hacking attempts, or any action intended to compromise system security or data integrity.
                        </p>
                        <p>
                            FinScope AI reserves the right to suspend or terminate access for any breach of these conditions.
                        </p>
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="terms-section">
                        <h2>Legal Disclaimer</h2>
                        <div className="terms-highlight">
                            <p>
                                FinScope AI is not a bank, financial institution, broker, or investment advisor.
                            </p>
                        </div>
                        <p>
                            All insights, calculations, predictions, and AI-generated content are provided for informational and educational purposes only and must not be considered financial, legal, or investment advice. Users remain fully responsible for any financial or personal decisions they make based on the use of the platform.
                        </p>
                    </div>

                    {/* Limitation of Liability */}
                    <div className="terms-section">
                        <h2>Limitation of Liability</h2>
                        <p>
                            FinScope AI is provided "as is" and "as available" without any guarantees regarding accuracy, reliability, performance, or availability. The project team shall not be held liable for:
                        </p>
                        <ul>
                            <li>Any direct or indirect losses</li>
                            <li>Financial loss</li>
                            <li>Data loss</li>
                            <li>Service interruption</li>
                            <li>Damages resulting from the use or inability to use the platform</li>
                        </ul>
                        <p>
                            Use of FinScope AI is entirely at the user's own risk.
                        </p>
                    </div>

                    {/* Privacy Policy */}
                    <div className="terms-section">
                        <h2>Privacy Policy</h2>

                        <h3>Data We Collect</h3>
                        <p>
                            FinScope AI may collect basic personal information such as name and email address, login credentials, and simulated financial data used for demonstration purposes. It may also collect technical data such as IP address, browser type, device information, and usage activity to help improve platform performance and security.
                        </p>
                        <p>
                            The platform does not require and does not encourage the submission of real banking or payment information.
                        </p>

                        <h3>How We Use Your Data</h3>
                        <p>
                            All collected data is used solely to operate, maintain, and improve the platform, support academic evaluation, enhance user experience, and ensure system security. Personal data is never sold, rented, or shared for commercial purposes.
                        </p>

                        <h3>Data Storage and Security</h3>
                        <p>
                            Reasonable technical and organizational measures are applied to protect user data, including secure servers, encrypted connections, and restricted access. While strong security practices are used, no digital system can be guaranteed to be completely secure.
                        </p>

                        <h3>Legal Basis for Processing</h3>
                        <p>
                            User data is processed based on user consent and legitimate academic and development purposes in accordance with GDPR and applicable UK data protection regulations.
                        </p>

                        <h3>User Rights</h3>
                        <p>
                            Users have the right to:
                        </p>
                        <ul>
                            <li>Request access to their data</li>
                            <li>Request correction of inaccurate information</li>
                            <li>Request deletion of their data</li>
                            <li>Withdraw consent</li>
                            <li>Request data portability</li>
                        </ul>
                        <p>
                            These rights can be exercised by contacting the project team through the email provided below.
                        </p>

                        <h3>Data Retention</h3>
                        <p>
                            Personal data is retained only for as long as necessary to support academic evaluation, system testing, and platform improvement. Once no longer required, data will be securely deleted.
                        </p>

                        <h3>Children's Privacy</h3>
                        <p>
                            FinScope AI is not intended for individuals under the age of 18. The platform does not knowingly collect personal data from minors.
                        </p>
                    </div>

                    {/* Cookies Policy */}
                    <div className="terms-section">
                        <h2>Cookies Policy</h2>

                        <h3>What Are Cookies</h3>
                        <p>
                            Cookies are small text files stored on a user's device that help websites function efficiently and improve user experience. They enable basic features such as session management and help analyze platform usage.
                        </p>

                        <h3>How We Use Cookies</h3>
                        <p>
                            FinScope AI uses:
                        </p>
                        <ul>
                            <li><strong>Necessary cookies</strong> to enable essential platform functionality such as login sessions and security features</li>
                            <li><strong>Analytics cookies</strong> to understand user interaction and improve platform performance</li>
                            <li><strong>Functional cookies</strong> to store user preferences</li>
                        </ul>

                        <h3>Cookie Consent and Control</h3>
                        <p>
                            By using FinScope AI, users consent to the use of cookies. Users can manage or disable cookies through their browser settings or any cookie consent mechanism implemented on the platform. Disabling cookies may reduce certain functionalities of the platform.
                        </p>
                    </div>

                    {/* Data Protection Statement */}
                    <div className="terms-section">
                        <h2>Privacy & Data Protection Statement</h2>
                        <p>
                            FinScope AI respects user privacy and processes all personal data in accordance with GDPR and the UK Data Protection Act. All data is stored securely and used only for educational, research, and system development purposes.
                        </p>
                    </div>

                    {/* Third-Party Services */}
                    <div className="terms-section">
                        <h2>Third-Party Services & APIs</h2>
                        <p>
                            FinScope AI may use third-party tools and services such as hosting providers, analytics platforms, authentication systems, and AI service providers to support platform functionality and performance.
                        </p>
                        <p>
                            These services may process limited technical or usage data on our behalf, strictly for operational and academic purposes. All third-party providers are selected based on their compliance with data protection and security standards, and no personal data is shared for marketing or commercial exploitation.
                        </p>
                    </div>

                    {/* Changes to Policy */}
                    <div className="terms-section">
                        <h2>Changes to This Policy</h2>
                        <p>
                            FinScope AI reserves the right to update or modify these Terms, Privacy Policy, and Cookies Policy at any time to reflect improvements in the platform, legal requirements, or academic project developments.
                        </p>
                        <p>
                            Any changes will be effective immediately once published. Users are encouraged to review this document periodically, and continued use of the platform after changes indicates acceptance of the updated policies.
                        </p>
                    </div>

                    {/* Final Notice */}
                    <div className="terms-section">
                        <h2>Final Notice</h2>
                        <p>
                            By using FinScope AI, users acknowledge that the platform is a student project, not a real financial system, and that all data provided should be non-sensitive and preferably simulated. Continued use of the platform indicates acceptance of these Terms, the Privacy Policy, and the Cookies Policy.
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="terms-contact">
                        <h3>Contact Information</h3>
                        <p>
                            For any questions, data requests, or privacy concerns, please contact us at:
                        </p>
                        <p>
                            <a href="mailto:finscopeai@gmail.com">finscopeai@gmail.com</a>
                        </p>
                    </div>

                    {/* Signature */}
                    <div className="terms-signature">
                        <p>
                            I, Mohammed Ageli, confirm that FinScope AI is a student project developed for academic purposes and that I am responsible for maintaining the platform in accordance with the policies and principles stated in this document. I commit to handling user data responsibly, ethically, and in compliance with applicable data protection regulations.
                        </p>
                        <div className="terms-signature-name">Mohammed Ageli</div>
                        <div className="terms-signature-title">Owner & Developer, FinScope AI</div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Terms;