// src/components/epaper/EditionSelector.jsx

import { useState, useRef, useEffect } from 'react';
import {
    FiMapPin,
    FiChevronDown,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight
} from 'react-icons/fi';
import { editions, getAvailableDates } from '../../data/epaperData';

const EditionSelector = ({
    selectedEdition,
    setSelectedEdition,
    selectedDate,
    setSelectedDate
}) => {
    const [showEditionDropdown, setShowEditionDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const dates = getAvailableDates();
    const dateScrollRef = useRef(null);
    const editionRef = useRef(null);
    const calendarRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editionRef.current && !editionRef.current.contains(event.target)) {
                setShowEditionDropdown(false);
            }
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const scrollDates = (direction) => {
        if (dateScrollRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            dateScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const currentEdition = editions.find(e => e.id === selectedEdition) || editions[0];

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            {/* Top Bar - Edition & Date Selection */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3 gap-4">

                    {/* Edition Selector */}
                    <div className="relative" ref={editionRef}>
                        <button
                            onClick={() => setShowEditionDropdown(!showEditionDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 
                         rounded-lg border border-gray-200 transition-all min-w-[180px]"
                        >
                            <FiMapPin className="text-primary" size={18} />
                            <div className="text-left flex-1">
                                <div className="text-xs text-gray-500">Select Edition</div>
                                <div className="font-semibold text-gray-800">{currentEdition.name}</div>
                            </div>
                            <FiChevronDown
                                className={`text-gray-400 transition-transform ${showEditionDropdown ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Edition Dropdown */}
                        {showEditionDropdown && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl 
                              border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <h4 className="font-semibold text-gray-700 text-sm">Choose Edition</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-1 p-2">
                                    {editions.map((edition) => (
                                        <button
                                            key={edition.id}
                                            onClick={() => {
                                                setSelectedEdition(edition.id);
                                                setShowEditionDropdown(false);
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all
                        ${selectedEdition === edition.id
                                                    ? 'bg-primary text-white'
                                                    : 'hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            <FiMapPin size={14} />
                                            <div>
                                                <div className="font-medium text-sm">{edition.name}</div>
                                                <div className={`text-xs ${selectedEdition === edition.id ? 'text-red-100' : 'text-gray-400'}`}>
                                                    {edition.nameLocal}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date Display & Calendar */}
                    <div className="relative" ref={calendarRef}>
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 hover:bg-primary/10 
                         rounded-lg border border-primary/20 transition-all"
                        >
                            <FiCalendar className="text-primary" size={18} />
                            <div className="text-left">
                                <div className="text-xs text-gray-500">Edition Date</div>
                                <div className="font-semibold text-gray-800">
                                    {dates.find(d => d.value === selectedDate)?.formatted || 'Select Date'}
                                </div>
                            </div>
                            <FiChevronDown
                                className={`text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Calendar Dropdown */}
                        {showCalendar && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl 
                              border border-gray-100 p-4 z-50">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-700">Select Date</h4>
                                    <span className="text-xs text-gray-400">Last 30 days available</span>
                                </div>
                                <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                                    {dates.map((date) => (
                                        <button
                                            key={date.value}
                                            onClick={() => {
                                                setSelectedDate(date.value);
                                                setShowCalendar(false);
                                            }}
                                            className={`flex flex-col items-center p-2 rounded-lg transition-all
                        ${selectedDate === date.value
                                                    ? 'bg-primary text-white'
                                                    : 'hover:bg-gray-50 text-gray-700'}`}
                                        >
                                            <span className={`text-xs ${selectedDate === date.value ? 'text-red-100' : 'text-gray-400'}`}>
                                                {date.weekday}
                                            </span>
                                            <span className="text-lg font-bold">{date.day}</span>
                                            <span className={`text-xs ${selectedDate === date.value ? 'text-red-100' : 'text-gray-400'}`}>
                                                {date.month}
                                            </span>
                                            {date.isToday && (
                                                <span className={`text-xs mt-1 px-1.5 py-0.5 rounded-full 
                          ${selectedDate === date.value ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                                                    Today
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Date Scroll */}
                <div className="relative pb-3">
                    <button
                        onClick={() => scrollDates('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg 
                       rounded-full p-1.5 hover:bg-gray-50 border border-gray-200"
                    >
                        <FiChevronLeft size={16} />
                    </button>

                    <div
                        ref={dateScrollRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide mx-8 pb-1"
                    >
                        {dates.slice(0, 14).map((date) => (
                            <button
                                key={date.value}
                                onClick={() => setSelectedDate(date.value)}
                                className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-lg 
                           transition-all border
                  ${selectedDate === date.value
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}
                            >
                                <span className={`text-xs ${selectedDate === date.value ? 'text-red-100' : 'text-gray-400'}`}>
                                    {date.weekday}
                                </span>
                                <span className="text-lg font-bold">{date.day}</span>
                                <span className={`text-xs ${selectedDate === date.value ? 'text-red-100' : 'text-gray-400'}`}>
                                    {date.month}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => scrollDates('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg 
                       rounded-full p-1.5 hover:bg-gray-50 border border-gray-200"
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditionSelector;