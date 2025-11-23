'use client';

import { useEffect, useState } from 'react';
import BeatCard from '@/components/BeatCard';
import { IBeat } from '@/models/Beat';

const categories = ['All', 'Drill', 'UK Rap', 'Jersey Club', 'Cinematic', 'Trap', 'R&B', 'Hip-Hop', 'Other'];

export default function BeatsPage() {
  const [beats, setBeats] = useState<IBeat[]>([]);
  const [filteredBeats, setFilteredBeats] = useState<IBeat[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeats();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredBeats(beats.filter(beat => !beat.isSold));
    } else {
      setFilteredBeats(beats.filter(beat => beat.category === selectedCategory && !beat.isSold));
    }
  }, [selectedCategory, beats]);

  const fetchBeats = async () => {
    try {
      const res = await fetch('/api/beats?sold=false');
      const data = await res.json();
      setBeats(data.beats || []);
      setFilteredBeats(data.beats || []);
    } catch (error) {
      console.error('Error fetching beats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Beat Store</h1>
          <p className="text-gray-600 text-lg">
            Premium beats across all genres
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Beats Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading beats...</p>
          </div>
        ) : filteredBeats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No beats available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeats.map((beat) => (
              <BeatCard key={beat._id.toString()} beat={beat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

