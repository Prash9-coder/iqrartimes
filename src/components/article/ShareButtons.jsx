// src/components/article/ShareButtons.jsx - FIXED

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Linkedin, Mail, Link2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const ShareButtons = ({ article }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = article?.title || '';

    const shareLinks = [
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-600 hover:bg-blue-700',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-sky-500 hover:bg-sky-600',
            url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'bg-blue-700 hover:bg-blue-800',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-green-600 hover:bg-green-700',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        // ✅ FIXED: Removed "sticky top-24" - parent handles sticky
        // ✅ FIXED: Added "relative z-20" for proper layering
        <div className="bg-white rounded-xl shadow-md p-6 relative z-20">
            <h3 className="font-bold text-lg mb-4">{t('article.share')}</h3>
            <div className="space-y-3">
                {shareLinks.map((link, index) => (
                    <motion.a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center space-x-3 ${link.color} text-white px-4 py-3 rounded-lg transition-colors`}
                    >
                        <link.icon size={20} />
                        <span className="font-medium">{link.name}</span>
                    </motion.a>
                ))}
                <motion.button
                    onClick={copyToClipboard}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        }`}
                >
                    <Link2 size={20} />
                    <span className="font-medium">
                        {copied ? 'Copied!' : (t('article.copyLink') || 'Copy Link')}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default ShareButtons;