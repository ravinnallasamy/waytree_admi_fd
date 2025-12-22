import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [conflict, setConflict] = useState(false);
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();
    const { requestOtp, verifyOtp } = useAuth();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await requestOtp(email);

        if (result.success) {
            setStep('otp');
        } else {
            setError(result.error || 'Failed to send OTP');
        }

        setIsLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setConflict(false);
        setSessions([]);

        const result = await verifyOtp(email, otp, false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            if (result.conflict) {
                setConflict(true);
                setSessions(result.sessions || []);
                setError(result.error || 'You are already logged in on another device');
            } else {
                setError(result.error || 'Invalid OTP');
            }
        }

        setIsLoading(false);
    };

    const handleLogoutFromOtherDevices = async () => {
        setIsLoading(true);
        setError('');
        setConflict(false);

        const result = await verifyOtp(email, otp, true);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Failed to logout from other devices');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
                        <p className="text-gray-400">
                            {step === 'email' ? 'Enter your email to receive OTP' : 'Enter the OTP sent to your email'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm text-center mb-3">{error}</p>
                            {conflict && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-yellow-400 text-xs text-center mb-2">
                                        Active sessions on other devices:
                                    </p>
                                    {sessions.length > 0 && (
                                        <div className="space-y-2">
                                            {sessions.map((session, idx) => (
                                                <div key={idx} className="text-xs text-gray-400 bg-gray-700/50 p-2 rounded">
                                                    <div className="font-medium">{session.deviceInfo || 'Unknown Device'}</div>
                                                    {session.ipAddress && (
                                                        <div className="text-gray-500">IP: {session.ipAddress}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleLogoutFromOtherDevices}
                                        disabled={isLoading}
                                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Logging out...
                                            </>
                                        ) : (
                                            <>
                                                Logout from Other Devices & Sign In Here
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500"
                                        placeholder="admin@waytree.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Request OTP
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    One-Time Password
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-500 text-center text-2xl tracking-widest font-mono"
                                        placeholder="123456"
                                        maxLength="6"
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-400 text-center">
                                    Check your email for the 6-digit code
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify & Login
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('email');
                                    setOtp('');
                                    setError('');
                                    setConflict(false);
                                    setSessions([]);
                                }}
                                className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors"
                            >
                                ← Back to email
                            </button>
                        </form>
                    )}
                </div>

                <div className="bg-gray-700/50 p-4 text-center border-t border-gray-700">
                    <p className="text-gray-400 text-sm">
                        {step === 'email' ? (
                            <>Admin email: admin@waytree.com</>
                        ) : (
                            <>OTP: <span className="font-mono font-bold text-indigo-400">123456</span></>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
