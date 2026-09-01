'use client';

import { useState } from 'react';
import { Camera, MapPin, ZoomIn } from 'lucide-react';
import type { Selfie, User } from '@/lib/types';
import { getUserPhoto } from '@/lib/utils';

interface SelfiesGalleryProps {
  selfies: Selfie[];
  users: User[];
}

export default function SelfiesGallery({ selfies, users }: SelfiesGalleryProps) {
  const [enlarged, setEnlarged] = useState<Selfie | null>(null);

  const sorted = [...selfies].sort((a, b) => b.timestamp - a.timestamp);

  const typeLabels: Record<string, { label: string; bg: string; text: string }> = {
    login: { label: 'IN', bg: 'bg-green-100', text: 'text-green-700' },
    checkin: { label: 'IN', bg: 'bg-green-100', text: 'text-green-700' },
    logout: { label: 'OUT', bg: 'bg-red-100', text: 'text-red-700' },
    checkout: { label: 'OUT', bg: 'bg-red-100', text: 'text-red-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-green-600" />
        <h2 className="text-lg font-bold text-gray-800">Selfies Gallery</h2>
        <span className="text-sm text-gray-400 ml-2">({sorted.length} photos)</span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-3" />
          <p>No selfies captured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sorted.map((selfie) => {
            const user = users.find((u) => u.id === selfie.user_id);
            const typeCfg = typeLabels[selfie.type] || typeLabels.login;
            return (
              <div
                key={selfie.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer group"
                onClick={() => setEnlarged(selfie)}
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  <img src={selfie.image_url} alt="Selfie" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${typeCfg.bg} ${typeCfg.text}`}>
                    {typeCfg.label}
                  </span>
                </div>
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    {user && <img src={getUserPhoto(user.email)} alt="" className="w-5 h-5 rounded-full object-cover" />}
                    <span className="text-xs font-medium text-gray-700 truncate">{user?.name || 'Unknown'}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{selfie.time}</p>
                  <p className="text-[10px] text-gray-400">{selfie.date}</p>
                  {selfie.geo && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{selfie.geo.address || 'Location captured'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {enlarged && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setEnlarged(null)}>
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={enlarged.image_url} alt="Selfie" className="w-full" />
            <div className="p-4">
              <div className="flex items-center gap-3">
                {users.find((u) => u.id === enlarged.user_id) && (
                  <img src={getUserPhoto(users.find((u) => u.id === enlarged.user_id)!.email)} alt="" className="w-10 h-10 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{users.find((u) => u.id === enlarged.user_id)?.name}</p>
                  <p className="text-sm text-gray-500">{enlarged.date} at {enlarged.time}</p>
                  {enlarged.geo && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {enlarged.geo.address}
                    </p>
                  )}
                </div>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold ${typeLabels[enlarged.type]?.bg || 'bg-gray-100'} ${typeLabels[enlarged.type]?.text || 'text-gray-700'}`}>
                  {typeLabels[enlarged.type]?.label}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEnlarged(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
