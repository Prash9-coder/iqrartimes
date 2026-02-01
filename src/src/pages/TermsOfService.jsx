import { motion } from 'framer-motion';
import { FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';

const TermsOfService = () => {
    return (
        <div className="mt-[20px] min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-black mb-6">
                        Terms of <span className="gradient-text">Service</span>
                    </h1>
                    <p className="text-lg text-gray-600">
                        Last updated: December 16, 202
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-8 mb-8"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <FileText className="text-primary" size={32} />
                        <h2 className="text-2xl font-black">Agreement to Terms</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        These Terms of Service constitute a legally binding agreement made between you and iqrar times Media Pvt. Ltd. concerning your access to and use of the iqrartimes website.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        By accessing the website, you agree that you have read, understood, and agree to be bound by all of these Terms of Service. If you do not agree with all of these terms, you are expressly prohibited from using the site.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-md p-8 mb-6"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                        <h2 className="text-2xl font-black">User Rights</h2>
                    </div>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Access and read all publicly available content on our website</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Share articles on social media platforms</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Subscribe to our newsletter and notifications</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Post comments and engage in discussions (when logged in)</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>Access personalized content recommendations</span>
                        </li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-md p-8 mb-6"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <XCircle className="text-red-600" size={32} />
                        <h2 className="text-2xl font-black">Prohibited Activities</h2>
                    </div>
                    <p className="text-gray-700 mb-4">
                        You may not access or use the site for any purpose other than that for which we make the site available. Prohibited activities include:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-red-600 mr-2">✗</span>
                            <span>Systematically retrieve data to create a database without permission</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-600 mr-2">✗</span>
                            <span>Circumvent, disable, or interfere with security features</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-600 mr-2">✗</span>
                            <span>Engage in unauthorized framing or linking</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-600 mr-2">✗</span>
                            <span>Upload viruses, spam, or any malicious code</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-600 mr-2">✗</span>
                            <span>Harass, abuse, or harm other users</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-600 mr-2">✗</span>
                            <span>Use the site for commercial purposes without authorization</span>
                        </li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-md p-8 mb-6"
                >
                    <div className="flex items-center space-x-3 mb-4">
                        <AlertCircle className="text-orange-600" size={32} />
                        <h2 className="text-2xl font-black">Intellectual Property</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        All content on this website, including but not limited to text, graphics, logos, images, videos, and software, is the property of iqrar times Media Pvt. Ltd. and is protected by international copyright and trademark laws.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit for commercial purposes any of the content without prior written consent from iqrar times.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-md p-8 mb-6"
                >
                    <h2 className="text-2xl font-black mb-4">User Contributions</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        When you post comments or other content on our website, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, modify, and publish such content.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        You represent and warrant that you own or control all rights to the content you post and that it does not violate any third-party rights or applicable laws.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-md p-8"
                >
                    <h2 className="text-2xl font-black mb-4">Disclaimer</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        The website is provided on an "as-is" and "as-available" basis. We make no warranties, expressed or implied, regarding the website's operation or the information, content, or materials included on it.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        We do not guarantee that the website will be error-free, secure, or available at all times. Your use of the website is at your own risk.
                    </p>
                </motion.div>

                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-md p-8 text-white mt-8"
                >
                    <h2 className="text-2xl font-black mb-4">Questions?</h2>
                    <p className="mb-4">
                        If you have any questions about these Terms of Service, please contact us:
                    </p>
                    <ul className="space-y-2">
                        <li>Email: legal@iqrartimes.com</li>
                        <li>Phone: +91 1800-XXX-XXXX</li>
                        <li>Address: Connaught Place, New Delhi - 110001, India</li>
                    </ul>
                </motion.div> */}
            </div>
        </div>
    );
};

export default TermsOfService;