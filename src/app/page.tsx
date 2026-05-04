'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Plus, Package, MapPin, Calendar, CheckCircle, Search, LogOut } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Item {
  id: number;
  deskripsi: string;
  sumber_lokasi: string;
  status: 'belum_diambil' | 'sudah_diambil';
  foto_url?: string;
  tanggal_waktu: string;
  kategori?: {
    nama_kategori: string;
  };
  laboratorium?: {
    nama_lab: string;
  };
  lokasiPenyimpanan?: {
    nama_lokasi: string;
  };
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchItems = async () => {
    try {
      const response = await apiFetch('/barang');
      const data = await response.json();
      if (response.ok) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpdateStatus = async (id: number) => {
    try {
      const response = await apiFetch(`/barang/${id}/status`, {
        method: 'PATCH',
      });

      if (response.ok) {
        // Optimistic update
        setItems(items.map(item =>
          item.id === id ? { ...item, status: 'sudah_diambil' as const } : item
        ));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  const filteredItems = items.filter(item =>
    item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori?.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.laboratorium?.nama_lab.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-xl font-bold text-primary">Patroli Barang</h1>
          <p className="text-xs text-gray-500">Lost & Found Dashboard</p>
        </motion.div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link href="/tambah" className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-active transition-all block">
              <Plus size={24} />
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari barang atau lokasi..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-gray-400">
            <div className="animate-spin text-primary">◌</div>
            <p>Memuat data barang...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3"
          >
            <Package size={48} strokeWidth={1.5} />
            <p>Tidak ada barang ditemukan</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="card flex gap-4"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    {item.foto_url ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.foto_url}`}
                        alt={item.deskripsi}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <h3 className="font-bold text-gray-900 leading-tight">
                            {item.kategori?.nama_kategori || 'Tanpa Kategori'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.deskripsi}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${item.status === 'sudah_diambil'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {item.status === 'sudah_diambil' ? 'Diambil' : 'Belum'}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin size={12} className="mr-1" />
                          {item.sumber_lokasi === 'laboratorium'
                            ? `Lab: ${item.laboratorium?.nama_lab}`
                            : item.sumber_lokasi.charAt(0).toUpperCase() + item.sumber_lokasi.slice(1)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 font-medium text-primary">
                          <Package size={12} className="mr-1" />
                          Simpan: {item.lokasiPenyimpanan?.nama_lokasi || '-'}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {new Date(item.tanggal_waktu).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {item.status === 'belum_diambil' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUpdateStatus(item.id)}
                        className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200 hover:bg-green-100 transition-colors w-fit"
                      >
                        <CheckCircle size={14} />
                        Telah Diambil
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
