import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tv, Radio } from 'lucide-react';

const LiveTV = () => {
    const [activeChannel, setActiveChannel] = useState(0);

    const channels = [
        {
            id: 1,
            name: 'Iqrar Times English',
            streamUrl: 'https://youtube.com/embed/80YU0CfeSDM?si=DgCVJ4sNFIx3qNNC',
            logo: '🇮🇳'
        },
        {
            id: 2,
            name: 'Iqrar Times Hindi',
            streamUrl: 'https://youtube.com/embed/80YU0CfeSDM?si=DgCVJ4sNFIx3qNNC',
            logo: '🇮🇳'
        },
        {
            id: 3,
            name: 'Iqrar Times Business',
            streamUrl: 'https://youtube.com/embed/F-HP3LKRGXI?si=DgCVJ4sNFIx3qNNC',
            logo: '📈'
        },
        {
            id: 4,
            name: 'Iqrar Times Sports',
            streamUrl: 'https://youtube.com/embed/mCdA4bJAGGk?si=DgCVJ4sNFIx3qNNC',
            logo: '⚽'
        },
    ];

    const schedule = [
        { time: '10:00 AM', show: 'Morning Headlines', current: false },
        { time: '11:00 AM', show: 'India Today', current: true },
        { time: '12:00 PM', show: 'Business Hour', current: false },
        { time: '01:00 PM', show: 'Afternoon News', current: false },
        { time: '02:00 PM', show: 'World Update', current: false },
        { time: '03:00 PM', show: 'Sports Center', current: false },
        { time: '04:00 PM', show: 'Technology Today', current: false },
        { time: '05:00 PM', show: 'Evening Prime', current: false },
        { time: '06:00 PM', show: 'Breaking News Hour', current: false },
        { time: '07:00 PM', show: 'Prime Time Debate', current: false },
        { time: '08:00 PM', show: 'The Big Story', current: false },
        { time: '09:00 PM', show: 'News Night', current: false },
    ];

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <h1 className="text-3xl md:text-4xl font-black uppercase flex items-center text-white">
                                <Tv className="text-primary mr-3" size={32} />
                                Live TV
                                <span className="ml-3 bg-red-600 text-white text-sm px-3 py-1 rounded-full flex items-center">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                                    LIVE
                                </span>
                            </h1>
                            <p className="text-gray-400">Watch live news coverage 24/7</p>
                        </motion.div>

                        {/* Video Player */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-black rounded-lg overflow-hidden mb-6"
                        >
                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                                <iframe
                                    key={activeChannel}
                                    src={channels[activeChannel].streamUrl}
                                    title={channels[activeChannel].name}
                                    className="absolute top-0 left-0 w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />

                                {/* Live Badge */}
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold flex items-center">
                                    <Radio size={14} className="mr-1 animate-pulse" />
                                    LIVE
                                </div>

                                {/* Channel Info */}
                                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                                    <span className="mr-2">{channels[activeChannel].logo}</span>
                                    <span className="font-bold">{channels[activeChannel].name}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Channel Selector - FIXED */}
                        <div className="bg-gray-800 rounded-lg p-6 mb-6">
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                                <Tv size={20} className="mr-2 text-primary" />
                                Select Channel
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {channels.map((channel, index) => (
                                    <motion.button
                                        key={channel.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveChannel(index)}
                                        className={`p-4 rounded-lg font-semibold text-sm transition-all flex flex-col items-center justify-center ${
                                            activeChannel === index
                                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        <span className="text-2xl mb-1">{channel.logo}</span>
                                        <span className="text-center">{channel.name}</span>
                                        {activeChannel === index && (
                                            <span className="text-xs mt-1 inline-flex items-center justify-center">
                                                <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></span>
                                                Now Playing
                                            </span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-white font-bold text-lg mb-4">📅 Today's Schedule</h3>
                            <div className="grid md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                                {schedule.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center p-3 rounded-lg ${
                                            item.current
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        <span className="font-semibold w-24 text-sm">{item.time}</span>
                                        <span className="flex-1 text-sm">{item.show}</span>
                                        {item.current && (
                                            <span className="bg-white text-primary text-xs px-2 py-1 rounded font-bold inline-flex items-center">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
                                                NOW
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-36 space-y-6 mt-[90px]">
                            {/* More Channels */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-white font-bold text-lg mb-4">📺 More Channels</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Iqrar Times Regional', viewers: '125K' },
                                        { name: 'Iqrar Times Entertainment', viewers: '89K' },
                                        { name: 'Iqrar Times World', viewers: '67K' },
                                    ].map((ch, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gray-700 p-3 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                                        >
                                            <span className="text-white font-medium text-sm">{ch.name}</span>
                                            <span className="text-gray-400 text-xs inline-flex items-center">
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
                                                {ch.viewers} watching
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Sharing */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-white font-bold text-lg mb-4">📢 Share Live</h3>
                                <div className="flex space-x-3">
                                    <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                        Facebook
                                    </button>
                                    <button className="flex-1 bg-sky-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors">
                                        Twitter
                                    </button>
                                    <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                                        WhatsApp
                                    </button>
                                </div>
                            </div>

                            {/* Live Comments */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-white font-bold text-lg mb-4">💬 Live Comments</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                                    {[
                                        { user: 'Rahul', comment: 'Great coverage! 👍', time: '1 min ago' },
                                        { user: 'Priya', comment: 'Very informative', time: '2 mins ago' },
                                        { user: 'Amit', comment: 'Keep up the good work!', time: '3 mins ago' },
                                    ].map((c, index) => (
                                        <div key={index} className="bg-gray-700 p-3 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-primary font-semibold text-sm">{c.user}</span>
                                                <span className="text-gray-500 text-xs">{c.time}</span>
                                            </div>
                                            <p className="text-white text-sm">{c.comment}</p>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Type your comment..."
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTV;