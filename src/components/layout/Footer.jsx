// src/components/layout/Footer.jsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Loader2, Check, X } from 'lucide-react';
import api from '../../utils/api';

const Footer = () => {
    const { t } = useTranslation();

    // Newsletter State
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Email validation
    const isValidEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Subscribe Handler
    const handleSubscribe = async () => {
        if (!email.trim()) {
            setStatus({ type: 'error', message: t('newsletter.emptyError') || 'Please enter your email' });
            return;
        }

        if (!isValidEmail(email)) {
            setStatus({ type: 'error', message: t('newsletter.invalidError') || 'Please enter a valid email' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('/backoffice/subscribe', { email: email.trim() });

            if (response.data) {
                setStatus({
                    type: 'success',
                    message: t('newsletter.successMessage') || 'Successfully subscribed! 🎉'
                });
                setEmail('');

                setTimeout(() => {
                    setStatus({ type: '', message: '' });
                }, 5000);
            }
        } catch (error) {
            console.error('Subscribe error:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                t('newsletter.errorMessage') ||
                'Subscription failed. Please try again.';

            if (error.response?.status === 409 || errorMessage.toLowerCase().includes('already')) {
                setStatus({
                    type: 'error',
                    message: t('newsletter.alreadySubscribed') || 'This email is already subscribed!'
                });
            } else {
                setStatus({ type: 'error', message: errorMessage });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSubscribe();
        }
    };

    const footerLinks = {
        categories: [
            { name: t('footer.india'), path: '/category/india' },
            { name: t('footer.world'), path: '/category/world' },
            { name: t('footer.business'), path: '/category/business' },
            { name: t('footer.technology'), path: '/category/technology' },
            { name: t('footer.sports'), path: '/category/sports' },
            { name: t('footer.entertainment'), path: '/category/entertainment' },
        ],
        company: [
            { name: t('footer.about'), path: '/about' },
            { name: t('footer.contact'), path: '/contact' },
            { name: t('footer.careers'), path: '/careers' },
            { name: t('footer.advertise'), path: '/advertise' },
        ],
        legal: [
            { name: t('footer.privacy'), path: '/privacy-policy' },
            { name: t('footer.terms'), path: '/terms-of-service' },
        ],
    };

    const socialLinks = [
        { icon: Facebook, color: 'hover:bg-blue-600 hover:text-white', url: 'https://www.facebook.com/share/1AoinTX4ft/' },
        { icon: Twitter, color: 'hover:bg-sky-500 hover:text-white', url: 'https://x.com/iqrartimesnews' },
        { icon: Instagram, color: 'hover:bg-pink-600 hover:text-white', url: 'https://www.instagram.com/iqrartimesnews?igsh=ZmVxczN3ZTBocDkx' },
        { icon: Youtube, color: 'hover:bg-red-600 hover:text-white', url: 'https://youtube.com/@iqrartimesnews?si=-ZS6YdPhQvjGNpcv' },
    ];

    return (
        <footer className="bg-white text-gray-900 mt-20 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Newsletter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 mb-12"
                >
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-2xl font-black mb-2 text-white">{t('newsletter.title')}</h3>
                            <p className="text-white/90">{t('newsletter.description')}</p>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex space-x-2">
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (status.type === 'error') {
                                                setStatus({ type: '', message: '' });
                                            }
                                        }}
                                        onKeyPress={handleKeyPress}
                                        placeholder={t('newsletter.placeholder')}
                                        disabled={loading}
                                        className={`px-4 py-3 rounded-lg text-gray-900 outline-none w-full md:w-80 transition-all
                                            ${status.type === 'error' ? 'ring-2 ring-red-500' : ''}
                                            ${status.type === 'success' ? 'ring-2 ring-green-500' : ''}
                                            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
                                        `}
                                    />
                                    {status.type && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2
                                                ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}
                                            `}
                                        >
                                            {status.type === 'success' ? <Check size={20} /> : <X size={20} />}
                                        </motion.span>
                                    )}
                                </div>
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.05 }}
                                    whileTap={{ scale: loading ? 1 : 0.95 }}
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className={`bg-white text-primary px-6 py-3 rounded-lg font-bold whitespace-nowrap 
                                        transition-all flex items-center justify-center min-w-[120px]
                                        ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-100 hover:shadow-lg'}
                                    `}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={18} />
                                            <span>...</span>
                                        </>
                                    ) : status.type === 'success' ? (
                                        <>
                                            <Check className="mr-2" size={18} />
                                            <span>{t('newsletter.subscribed') || 'Done!'}</span>
                                        </>
                                    ) : (
                                        t('newsletter.subscribe')
                                    )}
                                </motion.button>
                            </div>

                            {status.message && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-2 text-sm font-medium
                                        ${status.type === 'success' ? 'text-green-200' : 'text-red-200'}
                                    `}
                                >
                                    {status.message}
                                </motion.p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h4 className="font-black text-lg mb-4 uppercase text-gray-900">{t('footer.categories')}</h4>
                        <ul className="space-y-2">
                            {footerLinks.categories.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-600 hover:text-primary transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <h4 className="font-black text-lg mb-4 uppercase text-gray-900">{t('footer.company')}</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-600 hover:text-primary transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="font-black text-lg mb-4 uppercase text-gray-900">{t('footer.legal')}</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-600 hover:text-primary transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="border-t border-gray-200 pt-8 mb-8"
                >
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-3">
                            <Mail className="text-primary" size={20} />
                            <span className="text-gray-600 text-sm">contact@iqrartimes.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="text-primary" size={20} />
                            <span className="text-gray-600 text-sm">+91 9461785811</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPin className="text-primary" size={20} />
                            <span className="text-gray-600 text-sm">New Delhi, India</span>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-t border-gray-200 pt-8">
                    <div className="mb-6 md:mb-0">
                        <Link to="/" className="inline-block group">
                            <img
                                src="/iqrar1.png"
                                alt="Iqrar Times Logo"
                                className="h-12 md:h-16 w-auto object-contain mb-3 transition-transform group-hover:scale-105"
                            />
                        </Link>
                        <p className="text-gray-600 text-sm">
                            © 2025 Iqrar Times. {t('footer.copyright')}
                        </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end space-y-4">
                        <div className="flex space-x-3">
                            {socialLinks.map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center ${social.color} transition-all`}
                                >
                                    <social.icon size={20} />
                                </motion.a>
                            ))}
                        </div>

                        <motion.a
                            href="https://www.lifeboattechnologies.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.03 }}
                            className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-all group"
                        >
                            <span className="text-sm">Developed By</span>
                            <img
                                src="/life logo.png"
                                alt="Lifeboat Technologies"
                                className="h-6 md:h-7 w-auto object-contain transition-transform group-hover:scale-110"
                            />
                            <span className="text-sm">Lifeboat Technologies</span>
                        </motion.a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;