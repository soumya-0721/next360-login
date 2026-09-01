'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Check, X, MapPin } from 'lucide-react';

interface SelfieModalProps {
  isOpen: boolean;
  type: 'login' | 'logout' | 'checkin' | 'checkout';
  onConfirm: (dataUrl: string, geo?: { lat: string; lng: string; address: string }) => void;
  onCancel: () => void;
}

export default function SelfieModal({ isOpen, type, onConfirm, onCancel }: SelfieModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [geo, setGeo] = useState<{ lat: string; lng: string; address: string } | undefined>();

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCaptured(null);
      setGeo(undefined);
      return;
    }

    startCamera();
    fetchGeo();
  }, [isOpen, facingMode]);

  function stopStream() {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  }

  async function startCamera() {
    stopStream();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch {
      console.error('Camera access denied');
    }
  }

  function fetchGeo() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let address = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          address = data.display_name || '';
        } catch {
          address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
        setGeo({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          address,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const maxW = 400;
    const ratio = maxW / video.videoWidth;
    canvas.width = maxW;
    canvas.height = video.videoHeight * ratio;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
    setCaptured(dataUrl);
    stream?.getTracks().forEach((t) => t.stop());
  }

  function retake() {
    setCaptured(null);
    startCamera();
  }

  function confirm() {
    if (captured) onConfirm(captured, geo);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-800 capitalize">{type} Selfie</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="relative bg-black aspect-[4/3]">
          {captured ? (
            <img src={captured} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {geo && (
          <div className="px-4 py-2 bg-green-50 flex items-center gap-2 text-xs text-green-700">
            <MapPin className="w-3.5 h-3.5" />
            {geo.address || `${geo.lat}, ${geo.lng}`}
          </div>
        )}

        <div className="p-4 flex items-center justify-center gap-3">
          {!captured ? (
            <>
              <button
                onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={capture}
                className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white transition shadow-lg"
              >
                <Camera className="w-6 h-6" />
              </button>
              <button
                onClick={onCancel}
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
              >
                Retake
              </button>
              <button
                onClick={confirm}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
