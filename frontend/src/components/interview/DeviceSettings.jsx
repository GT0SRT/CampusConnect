import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(" ");

const DeviceSettings = ({ isDark, onDeviceChange }) => {
    const [showSettings, setShowSettings] = useState(false);
    const [audioDevices, setAudioDevices] = useState([]);
    const [videoDevices, setVideoDevices] = useState([]);
    const [selectedAudioId, setSelectedAudioId] = useState('');
    const [selectedVideoId, setSelectedVideoId] = useState('');

    // Enumerate all available devices
    useEffect(() => {
        const enumerateDevices = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                    console.warn('Device enumeration not supported on this device');
                    return;
                }

                const devices = await navigator.mediaDevices.enumerateDevices();

                const audioInputs = devices.filter(device => device.kind === 'audioinput');
                const videoInputs = devices.filter(device => device.kind === 'videoinput');

                setAudioDevices(audioInputs);
                setVideoDevices(videoInputs);

                // Set default devices
                if (audioInputs.length > 0) {
                    setSelectedAudioId(audioInputs[0].deviceId);
                    onDeviceChange?.('audio', audioInputs[0].deviceId);
                }
                if (videoInputs.length > 0) {
                    setSelectedVideoId(videoInputs[0].deviceId);
                    onDeviceChange?.('video', videoInputs[0].deviceId);
                }
            } catch (err) {
                console.error('Error enumerating devices:', err);
            }
        };

        enumerateDevices();

        // Listen for device changes (only if supported)
        if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
            navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
            return () => {
                if (navigator.mediaDevices && navigator.mediaDevices.removeEventListener) {
                    navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
                }
            };
        }
    }, [onDeviceChange]);

    const handleAudioChange = (deviceId) => {
        setSelectedAudioId(deviceId);
        onDeviceChange?.('audio', deviceId);
    };

    const handleVideoChange = (deviceId) => {
        setSelectedVideoId(deviceId);
        onDeviceChange?.('video', deviceId);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                    "flex h-12 w-16 flex-col items-center justify-center gap-1 rounded-lg p-3 transition",
                    isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-200 hover:bg-gray-300"
                )}
                title="Device Settings"
            >
                <Settings className={`h-5 w-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
            </button>

            {showSettings && (
                <div
                    className={`absolute bottom-full mb-2 right-0 rounded-lg shadow-lg border z-50 w-64 ${isDark
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-gray-200'
                        }`}
                >
                    <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Device Settings
                        </h3>
                    </div>

                    <div className="p-4 space-y-4">
                        {/* Microphone Selection */}
                        <div>
                            <label
                                className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'
                                    }`}
                            >
                                Microphone
                            </label>
                            {audioDevices.length > 0 ? (
                                <select
                                    value={selectedAudioId}
                                    onChange={(e) => handleAudioChange(e.target.value)}
                                    className={`w-full px-2 py-2 text-sm rounded border outline-none transition ${isDark
                                        ? 'bg-slate-700 border-slate-600 text-white focus:border-cyan-500'
                                        : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-cyan-500'
                                        }`}
                                >
                                    {audioDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div
                                    className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                                >
                                    No microphones found
                                </div>
                            )}
                        </div>

                        {/* Camera Selection */}
                        <div>
                            <label
                                className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'
                                    }`}
                            >
                                Camera
                            </label>
                            {videoDevices.length > 0 ? (
                                <select
                                    value={selectedVideoId}
                                    onChange={(e) => handleVideoChange(e.target.value)}
                                    className={`w-full px-2 py-2 text-sm rounded border outline-none transition ${isDark
                                        ? 'bg-slate-700 border-slate-600 text-white focus:border-cyan-500'
                                        : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-cyan-500'
                                        }`}
                                >
                                    {videoDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div
                                    className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                                >
                                    No cameras found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Close on click outside */}
                    <div
                        className="fixed inset-0 -z-10"
                        onClick={() => setShowSettings(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default DeviceSettings;
