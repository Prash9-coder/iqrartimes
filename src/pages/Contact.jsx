import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import Breadcrumb from '../components/common/Breadcrumb';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="mt-[120px] min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumb items={[{ label: 'Contact Us' }]} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-black mb-6">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Have a question or feedback? We'd love to hear from you.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl shadow-md p-8"
                    >
                        <h2 className="text-2xl font-black mb-6">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none transition-colors"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none transition-colors"
                                    placeholder="Subject"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none transition-colors resize-none"
                                    placeholder="Your message..."
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-accent transition-colors flex items-center justify-center space-x-2"
                            >
                                <Send size={20} />
                                <span>Send Message</span>
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-black mb-6">Contact Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <Mail className="text-primary mt-1" size={24} />
                                    <div>
                                        <h3 className="font-bold mb-1">Email</h3>
                                        <p className="text-gray-600">contact@iqrartimes.com</p>
                                        <p className="text-gray-600">support@iqrartimes.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <Phone className="text-primary mt-1" size={24} />
                                    <div>
                                        <h3 className="font-bold mb-1">Phone</h3>
                                        <p className="text-gray-600">+91 1800-XXX-XXXX</p>
                                        <p className="text-gray-600">+91 98765-43210</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <MapPin className="text-primary mt-1" size={24} />
                                    <div>
                                        <h3 className="font-bold mb-1">Address</h3>
                                        <p className="text-gray-600">
                                            iqrartimes Media Pvt. Ltd.<br />
                                            Connaught Place,<br />
                                            New Delhi - 110001, India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-md p-8 text-white">
                            <h2 className="text-2xl font-black mb-4">Business Hours</h2>
                            <div className="space-y-2">
                                <p className="flex justify-between">
                                    <span>Monday - Friday:</span>
                                    <span className="font-bold">9:00 AM - 6:00 PM</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Saturday:</span>
                                    <span className="font-bold">10:00 AM - 4:00 PM</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Sunday:</span>
                                    <span className="font-bold">Closed</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;