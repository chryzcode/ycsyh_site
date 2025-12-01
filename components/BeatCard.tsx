'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IBeat } from '@/models/Beat';

interface BeatCardProps {
  beat: IBeat;
}

export default function BeatCard({ beat }: BeatCardProps) {
  return (
    <Link href={`/beats/${beat._id}`} className="group h-full flex">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col w-full h-full">
        <div className="relative aspect-square bg-gray-100 flex-shrink-0">
          {beat.imageUrl ? (
            <Image
              src={beat.imageUrl}
              alt={beat.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
          )}
          {beat.isSold && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              SOLD
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1 min-h-[120px]">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-gray-600 transition-colors overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '3.5rem',
            lineHeight: '1.75rem'
          }}>
            {beat.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2 min-h-[1.25rem]">{beat.category}</p>
          <div className="flex justify-between items-center text-sm text-gray-600 mt-auto gap-2">
            <span className="truncate">{beat.bpm} BPM • {beat.key}</span>
            {!beat.isSold && (
              <span className="font-bold text-black whitespace-nowrap flex-shrink-0">From £{beat.mp3Price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

