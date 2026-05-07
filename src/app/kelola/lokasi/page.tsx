'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Plus, Pencil, Trash2, Check, X, Archive, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Lokasi {
  id: number;
  nama_lokasi: string;
  deskripsi?: string;
}

export default function KelolaLokasiPage() {
  const [data, setData] = useState<Lokasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form tambah
  const [newNama, setNewNama] = useState('');
  const [newDeskripsi, setNewDeskripsi] = useState('');
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Inline edit
  const [editId, setEditId] = useState<number | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [saving, setSaving] = useState(false);

  // Confirm delete
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/lokasi');
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
    if (!newNama.trim()) return;
    setAdding(true);
    setError('');
    try {
      const res = await apiFetch('/lokasi', {
        method: 'POST',
        body: JSON.stringify({ nama_lokasi: newNama.trim(), deskripsi: newDeskripsi.trim() || null }),
      });
      const json = await res.json();
      if (res.ok) {
        setData(prev => [...prev, json.data].sort((a, b) => a.nama_lokasi.localeCompare(b.nama_lokasi)));
        setNewNama('');
        setNewDeskripsi('');
        setShowForm(false);
      } else {
        setError(json.message || 'Gagal menambahkan lokasi.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editNama.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch(`/lokasi/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ nama_lokasi: editNama.trim(), deskripsi: editDeskripsi.trim() || null }),
      });
      const json = await res.json();
      if (res.ok) {
        setData(prev => prev
          .map(l => l.id === id ? { ...l, nama_lokasi: json.data.nama_lokasi, deskripsi: json.data.deskripsi } : l)
          .sort((a, b) => a.nama_lokasi.localeCompare(b.nama_lokasi))
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
      const res = await apiFetch(`/lokasi/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(prev => prev.filter(l => l.id !== id));
        setDeleteId(null);
      } else {
        const json = await res.json();
        setError(json.message || 'Gagal menghapus lokasi.');
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
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Archive size={16} className="text-amber-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Kelola Lokasi Simpan</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(f => !f); setError(''); }}
          className="p-2 bg-primary text-white rounded-full shadow hover:bg-primary-active transition-colors"
        >
          <Plus size={20} />
        </motion.button>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Form Tambah */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="card space-y-3 overflow-hidden"
            >
              <p className="text-sm font-semibold text-gray-700">Tambah Lokasi Penyimpanan</p>
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Nama lokasi (contoh: Ruang Laboran)"
                value={newNama}
                onChange={e => setNewNama(e.target.value)}
                disabled={adding}
              />
              <textarea
                className="input-field text-sm resize-none"
                rows={2}
                placeholder="Deskripsi (opsional)"
                value={newDeskripsi}
                onChange={e => setNewDeskripsi(e.target.value)}
                disabled={adding}
              />
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={adding || !newNama.trim()}
                  className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check size={15} />
                  {adding ? 'Menyimpan...' : 'Simpan'}
                </motion.button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  Batal
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

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
            <Archive size={40} strokeWidth={1.5} />
            <p className="text-sm">Belum ada lokasi penyimpanan</p>
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
                  className="card flex items-start gap-3 py-3"
                >
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Archive size={14} className="text-amber-500" />
                  </div>

                  {editId === item.id ? (
                    <div className="flex-1 space-y-1.5">
                      <input
                        autoFocus
                        className="input-field text-sm py-1.5 w-full"
                        value={editNama}
                        onChange={e => setEditNama(e.target.value)}
                        placeholder="Nama lokasi"
                      />
                      <textarea
                        className="input-field text-sm py-1.5 w-full resize-none"
                        rows={2}
                        value={editDeskripsi}
                        onChange={e => setEditDeskripsi(e.target.value)}
                        placeholder="Deskripsi (opsional)"
                        onKeyDown={e => { if (e.key === 'Escape') setEditId(null); }}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.nama_lokasi}</p>
                      {item.deskripsi && (
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.deskripsi}</p>
                      )}
                    </div>
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
                        <button onClick={() => { setEditId(item.id); setEditNama(item.nama_lokasi); setEditDeskripsi(item.deskripsi || ''); setDeleteId(null); }} className="p-1.5 text-primary hover:bg-primary/5 rounded-lg transition-colors">
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
