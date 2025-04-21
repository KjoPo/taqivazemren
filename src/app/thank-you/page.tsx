'use client';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-[#2C2A61] font-sans px-6">
      <img
        src="https://reg.usps.com/entreg/assets/images/des_brd_2color_logo_274x79.png"
        alt="USPS Logo"
        className="w-48 mb-6"
      />
      <h1 className="text-3xl font-bold mb-2 text-center">🎉 Thank You!</h1>
      <p className="text-center text-gray-600 text-lg max-w-md">
        Your billing has been verified successfully. We appreciate your confirmation.
      </p>
    </div>
  );
}
