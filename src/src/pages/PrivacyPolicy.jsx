import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';

const PrivacyPolicy = () => {
    const sections = [
        {
            icon: Shield,
            title: 'Information We Collect',
            content: `We collect information that you provide directly to us, including when you create an account, subscribe to our newsletter, post comments, or contact us. This may include your name, email address, and any other information you choose to provide.`
        },
        {
            icon: Lock,
            title: 'How We Use Your Information',
            content: `We use the information we collect to provide, maintain, and improve our services, to communicate with you, to monitor and analyze trends, and to personalize your experience. We may also use your information to send you newsletters and marketing communications.`
        },
        {
            icon: Eye,
            title: 'Information Sharing',
            content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website, conducting our business, or serving our users, as long as those parties agree to keep this information confidential.`
        },
        {
            icon: FileText,
            title: 'Your Rights',
            content: `You have the right to access, update, or delete your personal information at any time. You can also opt out of receiving marketing communications from us. If you have any questions about your data, please contact us at privacy@iqrartimes.com.`
        }
    ];

    return (
        <div className="mt-[20px] min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-black mb-6">
                        Privacy <span className="gradient-text">Policy</span>
                    </h1>
                    <p className="text-lg text-gray-600">
                        Last updated: December 16, 2025
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-8 mb-8"
                >
                    <p className="text-gray-700 leading-relaxed mb-6">
                        At iqrar times, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        By using our website, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the site.
                    </p>
                </motion.div>

                {sections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-md p-8 mb-6"
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <section.icon className="text-primary" size={32} />
                            <h2 className="text-2xl font-black">{section.title}</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{section.content}</p>
                    </motion.div>
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-8"
                >
                    <h2 className="text-2xl font-black mb-4">Cookies and Tracking</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
                    </p>
                    <h3 className="text-xl font-bold mb-3">Types of cookies we use:</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                        <li>Session Cookies - to operate our service</li>
                        <li>Preference Cookies - to remember your preferences</li>
                        <li>Security Cookies - for security purposes</li>
                        <li>Analytics Cookies - to understand how you use our website</li>
                    </ul>
                </motion.div>

                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-md p-8 text-white mt-8"
                >
                    <h2 className="text-2xl font-black mb-4">Contact Us</h2>
                    <p className="mb-4">
                        If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <ul className="space-y-2">
                        <li>Email: privacy@iqrartimes.com</li>
                        <li>Phone: +91 1800-XXX-XXXX</li>
                        <li>Address: Connaught Place, New Delhi - 110001, India</li>
                    </ul>
                </motion.div> */}
            </div>
        </div>
    );
};

export default PrivacyPolicy;