// src/components/common/Breadcrumb.jsx

import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumb = ({ items }) => {
    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-primary transition-colors flex items-center">
                <Home size={16} />
            </Link>
            {items.map((item, index) => {
                // ✅ Skip if label is "home" (case insensitive)
                if (item.label && item.label.toLowerCase() === 'home') {
                    return null;
                }

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-2"
                    >
                        <ChevronRight size={16} />
                        {item.link ? (
                            <Link to={item.link} className="hover:text-primary transition-colors">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-900 font-medium">{item.label}</span>
                        )}
                    </motion.div>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;