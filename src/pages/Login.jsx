// src/pages/Login.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Mail,
    Shield,
    ArrowRight,
    ArrowLeft,
    Loader2,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

const OTP_LENGTH = 4;

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        sendOtp,
        verifyOtp,
        isAuthenticated,
        user,
        loading: authLoading,
    } = useAuth();

    const [step, setStep] = useState('input');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const otpRefs = useRef([]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log("🔄 User authenticated, redirecting based on role:", user.role);

            let redirectPath = '/';

            switch (user.role) {
                case 'admin':
                    redirectPath = '/admin';
                    console.log("👑 Admin user → /admin");
                    break;
                case 'reporter':
                    redirectPath = '/admin';
                    console.log("📰 Reporter user → /admin");
                    break;
                case 'enduser':
                default:
                    redirectPath = location.state?.from?.pathname || '/';
                    console.log("👤 End user → home");
                    break;
            }

            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate, location]);

    // Resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Auto-focus OTP
    useEffect(() => {
        if (step === 'otp' && otpRefs.current[0]) {
            otpRefs.current[0].focus();
        }
    }, [step]);

    // Validate email
    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value.trim());
    };

    // Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const result = await sendOtp(trimmedEmail);

            if (result.success) {
                setStep('otp');
                setSuccess('OTP sent to your email!');
                setResendTimer(30);
                setOtp(new Array(OTP_LENGTH).fill(''));
            } else {
                setError(result.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // OTP change
    const handleOtpChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];

        // Handle paste
        if (value.length > 1) {
            const pastedOtp = value.slice(0, OTP_LENGTH).split('');
            pastedOtp.forEach((digit, i) => {
                if (i < OTP_LENGTH) newOtp[i] = digit;
            });
            setOtp(newOtp);
            otpRefs.current[Math.min(pastedOtp.length, OTP_LENGTH - 1)]?.focus();
            return;
        }

        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // OTP keydown
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        const otpString = otp.join('');
        if (otpString.length !== OTP_LENGTH) {
            setError(`Please enter the complete ${OTP_LENGTH}-digit OTP`);
            return;
        }

        setLoading(true);

        try {
            const result = await verifyOtp(email.trim(), otpString);

            if (result.success) {
                setSuccess('Login successful! Redirecting...');
            } else {
                setError(result.error || 'Invalid OTP');
                setOtp(new Array(OTP_LENGTH).fill(''));
                otpRefs.current[0]?.focus();
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (resendTimer > 0) return;

        setError('');
        setLoading(true);

        try {
            const result = await sendOtp(email.trim());

            if (result.success) {
                setSuccess('OTP resent successfully!');
                setResendTimer(30);
                setOtp(new Array(OTP_LENGTH).fill(''));
                otpRefs.current[0]?.focus();
            } else {
                setError(result.error || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // Back
    const handleBack = () => {
        setStep('input');
        setOtp(new Array(OTP_LENGTH).fill(''));
        setError('');
        setSuccess('');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block group">
                        <img
                            src="/iqrar1.png"
                            alt="Iqrar Times Logo"
                            className="w-40 h-36 mx-auto mb-4 object-contain bg-white rounded-xl p-1 shadow-lg transition-transform group-hover:scale-110"
                        />
                    </Link>

                    <p className="text-gray-600 mt-2">
                        {step === 'input' ? 'Sign in with your email' : 'Verify your identity'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 p-8">
                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-600">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    {/* Step 1: Email Input */}
                    {step === 'input' && (
                        <form onSubmit={handleSendOtp}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
                                        disabled={loading}
                                        autoFocus
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Get OTP
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp}>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Change email</span>
                            </button>

                            {/* Email Display */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">OTP sent to</p>
                                    <p className="font-semibold text-gray-900">{email}</p>
                                </div>
                            </div>

                            {/* OTP Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                                    Enter {OTP_LENGTH}-digit OTP
                                </label>
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (otpRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={OTP_LENGTH}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/30 transition-all"
                                            disabled={loading}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join('').length !== OTP_LENGTH}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        Verify & Login
                                    </>
                                )}
                            </button>

                            {/* Resend OTP */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Didn't receive OTP?{' '}
                                    {resendTimer > 0 ? (
                                        <span className="text-gray-500">
                                            Resend in <span className="font-mono font-semibold">{resendTimer}s</span>
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="text-red-600 hover:text-red-700 font-semibold hover:underline disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </p>
                            </div>
                        </form>
                    )}
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link
                        to="/"
                        className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>

                {/* Terms */}
                <p className="mt-4 text-center text-xs text-gray-500">
                    By continuing, you agree to our{' '}
                    <Link to="/terms-of-service" className="text-red-600 hover:underline">
                        Terms
                    </Link>{' '}
                    &{' '}
                    <Link to="/privacy-policy" className="text-red-600 hover:underline">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;