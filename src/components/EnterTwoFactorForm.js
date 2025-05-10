import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

export default function EnterTwoFactorForm({
    email,
    onSuccess,
    error,
}) {
    const [code, setCode] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [ticking, setTicking] = useState(0);
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        emailjs.init('qSC9QChymUGrSFCY5');
    }, []);

    useEffect(() => {
        if (email) sendOtp();
    }, [email]);

    useEffect(() => {
        if (ticking > 0) {
            const t = setTimeout(() => setTicking(ticking - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [ticking]);

    const sendOtp = async () => {
        if (!email) return;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);

        try {
            await emailjs.send(
                'service_b70nrww',
                'template_8clk7kc',
                {
                    to_name: "User",
                    to_email: email,
                    recipient: email,
                    email: email,
                    passcode: otp,
                    time: '15 minutes'
                },
                'qSC9QChymUGrSFCY5'
            );
            setTicking(60);
        } catch (err) {
            console.error('EmailJS send error:', err);
            setLocalError('Failed to send OTP. Please try again.');
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        const trimmed = code.trim();
        if (trimmed === generatedOtp) {
            setLocalError('');
            onSuccess(trimmed);
        } else {
            setLocalError('Invalid code. Please try again.');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl space-y-6"
        >
            <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">
                Step 2: Enter 2FA Code
            </h2>

            <p className="text-gray-700 text-sm">
                We sent a 6‑digit code to <span className="font-medium">{email}</span>. Please enter it below.
            </p>

            <div>
                <label htmlFor="twoFactorCode" className="block text-gray-600 mb-2">
                    2FA Code
                </label>
                <input
                    id="twoFactorCode"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter 6‑digit code"
                    required
                />
            </div>

            {(error || localError) && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200 flex items-center">
                    ⚠️ {localError || error}
                </div>
            )}

            <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 
                hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white 
                font-semibold rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
            >
                Verify Code
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={sendOtp}
                    disabled={ticking > 0}
                    className={`inline-block text-sm font-medium px-4 py-2 rounded-lg transition duration-200
            ${ticking > 0
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-white bg-purple-600 hover:bg-purple-700 hover:shadow-md'}
        `}
                >
                    {ticking > 0 ? `Resend in ${ticking}s` : 'Resend Code'}
                </button>
            </div>

        </form>
    );
}
