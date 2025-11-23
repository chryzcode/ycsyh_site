'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IBeat } from '@/models/Beat';
import FileUpload from '@/components/FileUpload';

export default function AdminPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<IBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBeat, setEditingBeat] = useState<IBeat | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Drill',
    bpm: 140,
    key: 'C',
    mp3Price: 45,
    wavPrice: 60,
    trackoutPrice: 300,
    exclusivePrice: 0,
    description: '',
    imageUrl: '',
    mp3Url: '',
    wavUrl: '',
    trackoutsUrl: '',
    isSold: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.admin) {
          setAuthenticated(true);
          fetchBeats();
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchBeats = async () => {
    try {
      const res = await fetch('/api/beats');
      const data = await res.json();
      setBeats(data.beats || []);
    } catch (error) {
      console.error('Error fetching beats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBeat) {
        await fetch(`/api/beats/${editingBeat._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/beats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      fetchBeats();
      resetForm();
    } catch (error) {
      console.error('Error saving beat:', error);
      alert('Failed to save beat');
    }
  };

  const handleEdit = (beat: IBeat) => {
    setEditingBeat(beat);
    setFormData({
      title: beat.title,
      category: beat.category,
      bpm: beat.bpm,
      key: beat.key,
      mp3Price: beat.mp3Price,
      wavPrice: beat.wavPrice,
      trackoutPrice: beat.trackoutPrice,
      exclusivePrice: beat.exclusivePrice || 0,
      description: beat.description || '',
      imageUrl: beat.imageUrl || '',
      mp3Url: beat.mp3Url,
      wavUrl: beat.wavUrl || '',
      trackoutsUrl: beat.trackoutsUrl || '',
      isSold: beat.isSold,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this beat?')) return;
    try {
      await fetch(`/api/beats/${id}`, { method: 'DELETE' });
      fetchBeats();
    } catch (error) {
      console.error('Error deleting beat:', error);
      alert('Failed to delete beat');
    }
  };

  const toggleSold = async (beat: IBeat) => {
    try {
      await fetch(`/api/beats/${beat._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSold: !beat.isSold }),
      });
      fetchBeats();
    } catch (error) {
      console.error('Error updating beat:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Drill',
      bpm: 140,
      key: 'C',
      mp3Price: 45,
      wavPrice: 60,
      trackoutPrice: 300,
      exclusivePrice: 0,
      description: '',
      imageUrl: '',
      mp3Url: '',
      wavUrl: '',
      trackoutsUrl: '',
      isSold: false,
    });
    setEditingBeat(null);
    setShowForm(false);
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              {showForm ? 'Cancel' : '+ Add New Beat'}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {editingBeat ? 'Edit Beat' : 'Add New Beat'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Drill</option>
                    <option>UK Rap</option>
                    <option>Jersey Club</option>
                    <option>Cinematic</option>
                    <option>Trap</option>
                    <option>R&B</option>
                    <option>Hip-Hop</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">BPM *</label>
                  <input
                    type="number"
                    required
                    min="60"
                    max="200"
                    value={formData.bpm}
                    onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Key *</label>
                  <input
                    type="text"
                    required
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">MP3 Lease Price (£) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.mp3Price}
                    onChange={(e) => setFormData({ ...formData, mp3Price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WAV Lease Price (£) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.wavPrice}
                    onChange={(e) => setFormData({ ...formData, wavPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Trackout Lease Price (£) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.trackoutPrice}
                    onChange={(e) => setFormData({ ...formData, trackoutPrice: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exclusive Price (£) - Optional</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.exclusivePrice}
                    onChange={(e) => setFormData({ ...formData, exclusivePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Leave 0 if not available"
                  />
                </div>
                <div>
                  <FileUpload
                    label="MP3 File *"
                    value={formData.mp3Url}
                    onChange={(url) => setFormData({ ...formData, mp3Url: url })}
                    accept="audio/mpeg,audio/mp3"
                  />
                </div>
                <div>
                  <FileUpload
                    label="Cover Image"
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    accept="image/*"
                  />
                </div>
                <div>
                  <FileUpload
                    label="WAV File"
                    value={formData.wavUrl}
                    onChange={(url) => setFormData({ ...formData, wavUrl: url })}
                    accept="audio/wav,audio/wave"
                  />
                </div>
                <div>
                  <FileUpload
                    label="Trackouts (ZIP)"
                    value={formData.trackoutsUrl}
                    onChange={(url) => setFormData({ ...formData, trackoutsUrl: url })}
                    accept=".zip,application/zip"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSold}
                  onChange={(e) => setFormData({ ...formData, isSold: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Mark as Sold</label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  {editingBeat ? 'Update Beat' : 'Create Beat'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading beats...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {beats.map((beat) => (
                  <tr key={beat._id.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {beat.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {beat.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      From £{beat.mp3Price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleSold(beat)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          beat.isSold
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {beat.isSold ? 'SOLD' : 'AVAILABLE'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(beat)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(beat._id.toString())}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

