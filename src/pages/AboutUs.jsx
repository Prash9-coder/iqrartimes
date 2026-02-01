import { motion } from 'framer-motion';
import { Users, Award, Globe, TrendingUp } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';

const AboutUs = () => {
    const stats = [
        { icon: Users, label: 'Active Readers', value: '10M+' },
        { icon: Award, label: 'Awards Won', value: '25+' },
        { icon: Globe, label: 'Countries', value: '50+' },
        { icon: TrendingUp, label: 'Daily Articles', value: '100+' },
    ];

    const team = [
        { name: 'Rajesh Kumar', role: 'Editor in Chief', image: 'https://i.pravatar.cc/150?img=12' },
        { name: 'Priya Sharma', role: 'Managing Editor', image: 'https://i.pravatar.cc/150?img=5' },
        { name: 'Amit Verma', role: 'Tech Lead', image: 'https://i.pravatar.cc/150?img=15' },
        { name: 'Sneha Reddy', role: 'Senior Reporter', image: 'https://i.pravatar.cc/150?img=10' },
    ];

    return (
        <div className="mt-[120px] min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumb items={[{ label: 'About Us' }]} />

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-black mb-6">
                        About <span className="gradient-text">IQRAR TIMES</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Your trusted source for breaking news, in-depth analysis, and compelling stories from around the world.
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-md p-6 text-center"
                        >
                            <stat.icon className="mx-auto text-primary mb-3" size={40} />
                            <h3 className="text-3xl font-black mb-2">{stat.value}</h3>
                            <p className="text-gray-600">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Mission */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-8 mb-16"
                >
                    <h2 className="text-3xl font-black mb-6">Our Mission</h2>
                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                        At Iqrar Times, we believe in the power of journalism to inform, inspire, and create positive change. Our mission is to deliver accurate, unbiased, and timely news coverage that empowers our readers to make informed decisions.
                    </p>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        We are committed to maintaining the highest standards of journalistic integrity, transparency, and accountability in everything we do.
                    </p>
                </motion.div>

                {/* Team */}
                <div className="mb-16">
                    <h2 className="text-3xl font-black mb-8 text-center">Meet Our Team</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow"
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4"
                                />
                                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                                <p className="text-gray-600">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Values */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary to-accent rounded-xl shadow-md p-8 text-white"
                >
                    <h2 className="text-3xl font-black mb-6">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Integrity</h3>
                            <p>We uphold the highest standards of honesty and ethical journalism.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Accuracy</h3>
                            <p>We verify facts and provide reliable information to our readers.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Independence</h3>
                            <p>We maintain editorial independence and report without bias.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutUs;