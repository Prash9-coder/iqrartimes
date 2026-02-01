// src/components/admin/EPaperBackupManager.jsx

import { useState, useEffect } from 'react';
import {
    FiDownload,
    FiUpload,
    FiRefreshCw,
    FiTrash2,
    FiAlertTriangle,
    FiCheckCircle,
    FiDatabase,
    FiHardDrive
} from 'react-icons/fi';
import { epaperStorage } from '../../utils/epaperStorage';

const EPaperBackupManager = ({ onRestore }) => {
    const [backupInfo, setBackupInfo] = useState({ hasBackup: false, timestamp: null, count: 0 });
    const [isRestoring, setIsRestoring] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ totalEpapers: 0, totalPages: 0, editions: 0 });

    useEffect(() => {
        refreshInfo();
    }, []);

    const refreshInfo = () => {
        setBackupInfo(epaperStorage.getBackupInfo());
        setStats(epaperStorage.getStats());
    };

    const showMessage = (text) => {
        setMessage(text);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleExport = () => {
        setIsExporting(true);

        try {
            const blob = epaperStorage.exportData();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `epaper-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showMessage('✅ Data exported successfully!');
        } catch (error) {
            showMessage('❌ Export failed: ' + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsRestoring(true);

        try {
            await epaperStorage.importData(file);
            showMessage('✅ Data imported successfully!');
            refreshInfo();
            if (onRestore) onRestore();
        } catch (error) {
            showMessage('❌ Import failed: ' + error.message);
        } finally {
            setIsRestoring(false);
            event.target.value = '';
        }
    };

    const handleRestore = () => {
        if (!confirm('Restore from last backup? This may overwrite current data.')) return;

        setIsRestoring(true);

        const success = epaperStorage.restoreFromBackup();
        if (success) {
            showMessage('✅ Data restored from backup!');
            refreshInfo();
            if (onRestore) onRestore();
        } else {
            showMessage('❌ No backup found');
        }

        setIsRestoring(false);
    };

    const handleClearAll = () => {
        if (!confirm('⚠️ Delete ALL e-paper data? This cannot be undone!')) return;
        if (!confirm('Are you absolutely sure? Type "DELETE" mentally and click OK.')) return;

        setIsClearing(true);

        const success = epaperStorage.clearAll();
        if (success) {
            showMessage('✅ All data cleared!');
            refreshInfo();
            if (onRestore) onRestore();
        } else {
            showMessage('❌ Failed to clear data');
        }

        setIsClearing(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiDatabase className="text-primary" />
                E-Paper Backup & Storage
            </h3>

            {/* Message */}
            {message && (
                <div className={`
                    mb-4 p-3 rounded-lg flex items-center gap-2
                    ${message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : ''}
                    ${message.includes('❌') ? 'bg-red-50 border border-red-200 text-red-700' : ''}
                `}>
                    {message.includes('✅') && <FiCheckCircle size={16} />}
                    {message.includes('❌') && <FiAlertTriangle size={16} />}
                    {message}
                </div>
            )}

            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                    <FiHardDrive className="mx-auto text-blue-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-blue-700">{stats.totalEpapers}</div>
                    <div className="text-xs text-blue-600">E-Papers</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{stats.totalPages}</div>
                    <div className="text-xs text-green-600">Total Pages</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">{stats.editions}</div>
                    <div className="text-xs text-purple-600">Editions</div>
                </div>

                <div className={`rounded-xl p-4 text-center ${backupInfo.hasBackup
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100'
                    }`}>
                    <div className={`text-sm font-bold ${backupInfo.hasBackup ? 'text-emerald-700' : 'text-gray-500'}`}>
                        {backupInfo.hasBackup ? '✓ Backup Ready' : 'No Backup'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {backupInfo.timestamp
                            ? backupInfo.timestamp.toLocaleDateString()
                            : 'Never'
                        }
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                    onClick={handleExport}
                    disabled={isExporting || stats.totalEpapers === 0}
                    className="flex items-center justify-center gap-2 bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    <FiDownload size={18} />
                    {isExporting ? 'Exporting...' : 'Export'}
                </button>

                <label className="flex items-center justify-center gap-2 bg-blue-50 border-2 border-blue-200 text-blue-700 px-4 py-3 rounded-xl hover:bg-blue-100 transition-all cursor-pointer font-medium">
                    <FiUpload size={18} />
                    {isRestoring ? 'Importing...' : 'Import'}
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                        disabled={isRestoring}
                    />
                </label>

                <button
                    onClick={handleRestore}
                    disabled={isRestoring || !backupInfo.hasBackup}
                    className="flex items-center justify-center gap-2 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl hover:bg-yellow-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    <FiRefreshCw size={18} />
                    Restore
                </button>

                <button
                    onClick={handleClearAll}
                    disabled={isClearing || stats.totalEpapers === 0}
                    className="flex items-center justify-center gap-2 bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    <FiTrash2 size={18} />
                    Clear All
                </button>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Storage Info:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Images stored in browser's IndexedDB (large storage)</li>
                    <li>• Metadata stored in localStorage (fast access)</li>
                    <li>• Export creates a backup JSON file (download regularly!)</li>
                    <li>• Import merges with existing data without duplicates</li>
                </ul>
            </div>
        </div>
    );
};

export default EPaperBackupManager;