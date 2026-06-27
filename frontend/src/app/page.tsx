'use client';

import { useState, useEffect } from 'react';

interface WifiNetwork {
  ssid: string;
  bssid: string;
  frequency: number;
  signal_strength: number;
  encryption: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  first_seen: string;
  last_seen: string;
}

export default function Home() {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total_networks: 0, countries_covered: 0, cities_covered: 0, open_networks: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [networksRes, statsRes] = await Promise.all([
        fetch('http://localhost:3001/api/networks'),
        fetch('http://localhost:3001/api/stats'),
      ]);
      const networksData = await networksRes.json();
      const statsData = await statsRes.json();
      if (networksData.success) setNetworks(networksData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) setNetworks(data.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (strength: number) => {
    if (strength > -50) return 'text-green-400';
    if (strength > -70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">📡</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              WiGLE WiFi
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Global WiFi wardriving map - discover networks worldwide</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
            <p className="text-3xl font-bold text-cyan-400">{(stats.total_networks / 1000000).toFixed(1)}M</p>
            <p className="text-gray-400 text-sm">Networks</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
            <p className="text-3xl font-bold text-blue-400">{stats.countries_covered}</p>
            <p className="text-gray-400 text-sm">Countries</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
            <p className="text-3xl font-bold text-purple-400">{(stats.cities_covered / 1000).toFixed(1)}K</p>
            <p className="text-gray-400 text-sm">Cities</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
            <p className="text-3xl font-bold text-green-400">{(stats.open_networks / 1000).toFixed(0)}K</p>
            <p className="text-gray-400 text-sm">Open Networks</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SSID, BSSID, or location..."
              className="flex-1 px-6 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              🔍 Search
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-cyan-400">Discovered Networks</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {networks.map((network, i) => (
              <div key={i} className="p-4 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      network.signal_strength > -50 ? 'bg-green-400' :
                      network.signal_strength > -70 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="font-semibold">{network.ssid}</p>
                      <p className="text-sm text-gray-400 font-mono">{network.bssid}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getSignalColor(network.signal_strength}`}>
                      {network.signal_strength} dBm
                    </p>
                    <p className="text-sm text-gray-400">{network.encryption}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>{network.city}, {network.country}</p>
                    <p>{network.frequency} MHz</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
