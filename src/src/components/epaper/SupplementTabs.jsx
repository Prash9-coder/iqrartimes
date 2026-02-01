// src/components/epaper/SupplementTabs.jsx

import { supplements } from '../../data/epaperData';

const SupplementTabs = ({ selectedSupplement, setSelectedSupplement }) => {
    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
                    {supplements.map((supplement) => (
                        <button
                            key={supplement.id}
                            onClick={() => setSelectedSupplement(supplement.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap 
                         transition-all font-medium text-sm
                ${selectedSupplement === supplement.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'}`}
                        >
                            <span>{supplement.icon}</span>
                            <span>{supplement.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupplementTabs;