'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Tag, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Kategori {
  id: number;
  nama_kategori: string;
}

export default function KelolaKategoriPage() {
  const [data, setData] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form tambah
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Inline edit
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/kategori');
      const json = await res.json();
      if (res.ok) setData(json.data || []);
    } catch {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await apiFetch('/kategori', {
        method: 'POST',
        body: JSON.stringify({ nama_kategori: newName.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setData(prev => [...prev, json.data].sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori)));
        setNewName('');
      } else {
        setError(json.message || 'Gagal menambahkan kategori.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch(`/kategori/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nama_kategori: editName.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setData(prev => prev
          .map(k => k.id === id ? { ...k, nama_kategori: json.data.nama_kategori } : k)
          .sort((a, b) => a.nama_kategori.localeCompare(b.nama_kategori))
        );
        setEditId(null);
      } else {
        setError(json.message || 'Gagal menyimpan perubahan.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try {
      const res = await apiFetch(`/kategori/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(prev => prev.filter(k => k.id !== id));
        setDeleteId(null);
      } else {
        const json = await res.json();
        setError(json.message || 'Gagal menghapus kategori.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Tag size={16} className="text-blue-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Kelola Kategori</h1>
        </div>
        <span className="text-xs text-gray-400 font-medium">{data.length} item</span>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Form Tambah */}
        <form onSubmit={handleAdd} className="card flex gap-2">
          <input
            type="text"
            className="input-field flex-1 text-sm"
            placeholder="Nama kategori baru..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            disabled={adding}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={adding || !newName.trim()}
            className="btn-primary px-4 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            <span className="text-sm">Tambah</span>
          </motion.button>
        </form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <div className="animate-spin text-2xl text-primary">◌</div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <Tag size={40} strokeWidth={1.5} />
            <p className="text-sm">Belum ada kategori</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {data.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card flex items-center gap-3 py-3"
                >
                  <div className="w-7 h-7 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                    <Tag size={14} className="text-blue-500" />
                  </div>

                  {editId === item.id ? (
                    <input
                      autoFocus
                      className="input-field flex-1 text-sm py-1.5"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(item.id); if (e.key === 'Escape') setEditId(null); }}
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-gray-800">{item.nama_kategori}</span>
                  )}

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {editId === item.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(item.id)} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    ) : deleteId === item.id ? (
                      <>
                        <span className="text-xs text-red-600 mr-1">Hapus?</span>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setDeleteId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(item.id); setEditName(item.nama_kategori); setDeleteId(null); }} className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => { setDeleteId(item.id); setEditId(null); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </>
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
