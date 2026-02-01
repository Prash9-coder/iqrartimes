import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

const InlineImage = ({ image }) => {
    // Handle cases where image is a string (URL) or an object with url property
    const imageUrl = typeof image === 'string' ? image : image?.url;
    const caption = typeof image === 'string' ? '' : image?.caption;
    const credit = typeof image === 'string' ? '' : image?.credit;

    if (!imageUrl) {
        console.warn('⚠️ InlineImage: No valid image URL provided');
        return null;
    }

    return (
        <motion.figure
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-8"
        >
            <div className="relative rounded-lg overflow-hidden shadow-lg">
                <img
                    src={imageUrl}
                    alt={caption}
                    className="w-full h-auto"
                />
                {credit && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Camera size={12} />
                        <span>{credit}</span>
                    </div>
                )}
            </div>
            {caption && (
                <figcaption className="mt-3 text-gray-600 text-sm italic text-center border-l-4 border-primary pl-4 py-2 bg-gray-50">
                    {caption}
                </figcaption>
            )}
        </motion.figure>
    );
};

export default InlineImage;