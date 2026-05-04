'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { ArrowLeft, Camera, Upload, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Lab {
  id: number;
  nama_lab: string;
}

interface Kategori {
  id: number;
  nama_kategori: string;
}

interface StorageLocation {
  id: number;
  nama_lokasi: string;
}

export default function TambahBarangPage() {
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [source, setSource] = useState<'laboratorium' | 'cleaning service' | 'mahasiswa'>('laboratorium');
  const [labId, setLabId] = useState('');
  const [lokasiLain, setLokasiLain] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [kategoriId, setKategoriId] = useState('');
  const [storageId, setStorageId] = useState('');
  const [detailPenyimpanan, setDetailPenyimpanan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labRes, catRes, locRes] = await Promise.all([
          apiFetch('/laboratorium'),
          apiFetch('/kategori'),
          apiFetch('/lokasi')
        ]);

        if (labRes.ok) {
          const labData = await labRes.json();
          setLabs(labData.data || []);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }

        if (locRes.ok) {
          const locData = await locRes.json();
          setStorageLocations(locData.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('deskripsi', deskripsi);
    formData.append('kategori_id', kategoriId);
    formData.append('sumber_lokasi', source);
    if (source === 'laboratorium' && labId) {
      formData.append('lab_id', labId);
    }
    formData.append('lokasi_id', storageId);
    formData.append('detail_penyimpanan', detailPenyimpanan);
    formData.append('tanggal_waktu', new Date().toISOString().slice(0, 19).replace('T', ' '));

    // Keeping this for backward compatibility if backend still uses it, or UI needs it
    let displayLokasi = '';
    if (source === 'laboratorium') {
      const labName = labs.find(l => l.id === Number(labId))?.nama_lab;
      displayLokasi = `Lab: ${labName}${lokasiLain ? ` (${lokasiLain})` : ''}`;
    } else if (source === 'cleaning service') {
      displayLokasi = `Cleaning Service: ${lokasiLain}`;
    } else {
      displayLokasi = `Mahasiswa: ${lokasiLain}`;
    }
    formData.append('lokasi', displayLokasi);
    if (image) {
      formData.append('foto', image);
    }

    try {
      const response = await apiFetch('/barang', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Gagal menambahkan barang. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
        >
          <Check size={40} />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900"
        >
          Berhasil!
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500"
        >
          Data barang telah berhasil disimpan.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Tambah Barang</h1>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6 flex-1"
        onSubmit={handleSubmit}
      >
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Foto Barang</label>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => document.getElementById('image-input')?.click()}
            className="relative aspect-video w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.img
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <Camera size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Ambil Foto atau Pilih Gambar</span>
                </motion.div>
              )}
            </AnimatePresence>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageChange}
            />
          </motion.div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="nama" className="block text-sm font-semibold text-gray-700">Nama Barang</label>
          <input
            id="nama"
            type="text"
            required
            className="input-field"
            placeholder="Contoh: Kunci Motor, Jaket"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="kategori" className="block text-sm font-semibold text-gray-700">Kategori Barang</label>
          <select
            id="kategori"
            required
            className="input-field"
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
          >
            <option value="">Pilih Kategori...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nama_kategori}</option>
            ))}
          </select>
        </div>

        {/* Location Source */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Sumber Temuan</label>
          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="source"
                className="w-5 h-5 accent-primary"
                checked={source === 'laboratorium'}
                onChange={() => setSource('laboratorium')}
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Laboratorium</span>
                <span className="text-xs text-gray-500">Ditemukan di area laboratorium</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="source"
                className="w-5 h-5 accent-primary"
                checked={source === 'cleaning service'}
                onChange={() => setSource('cleaning service')}
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Temuan Cleaning Service</span>
                <span className="text-xs text-gray-500">Diserahkan oleh petugas kebersihan</span>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name="source"
                className="w-5 h-5 accent-primary"
                checked={source === 'mahasiswa'}
                onChange={() => setSource('mahasiswa')}
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Temuan Mahasiswa</span>
                <span className="text-xs text-gray-500">Diserahkan oleh mahasiswa</span>
              </div>
            </label>
          </div>
        </div>

        {/* Location Detail */}
        <AnimatePresence mode="wait">
          {source === 'laboratorium' && (
            <motion.div
              key="lab-select"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <label htmlFor="lab" className="block text-sm font-semibold text-gray-700">Pilih Laboratorium</label>
              <select
                id="lab"
                required
                className="input-field"
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
              >
                <option value="">Pilih Lab...</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>{lab.nama_lab}</option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label htmlFor="lokasi" className="block text-sm font-semibold text-gray-700">Detail Lokasi Penemuan</label>
          <textarea
            id="lokasi"
            required
            rows={2}
            className="input-field"
            placeholder={source === 'laboratorium' ? "Contoh: Di bawah meja nomor 5" : "Contoh: Di kursi depan Gedung C"}
            value={lokasiLain}
            onChange={(e) => setLokasiLain(e.target.value)}
          />
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Informasi Penyimpanan</h2>

          {/* Storage Location */}
          <div className="space-y-2">
            <label htmlFor="storage" className="block text-sm font-semibold text-gray-700">Lokasi Penyimpanan</label>
            <select
              id="storage"
              required
              className="input-field"
              value={storageId}
              onChange={(e) => setStorageId(e.target.value)}
            >
              <option value="">Pilih Lokasi Simpan...</option>
              {storageLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.nama_lokasi}</option>
              ))}
            </select>
          </div>

          {/* Storage Detail */}
          <div className="space-y-2">
            <label htmlFor="storage-detail" className="block text-sm font-semibold text-gray-700">Detail Penyimpanan</label>
            <textarea
              id="storage-detail"
              rows={2}
              className="input-field"
              placeholder="Contoh: Lemari A, Laci Meja, dsb."
              value={detailPenyimpanan}
              onChange={(e) => setDetailPenyimpanan(e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="deskripsi" className="block text-sm font-semibold text-gray-700">Deskripsi (Opsional)</label>
          <textarea
            id="deskripsi"
            rows={3}
            className="input-field"
            placeholder="Ciri-ciri barang atau informasi tambahan..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              ◌
            </motion.span>
          ) : (
            <Upload size={20} />
          )}
          {loading ? 'Menyimpan...' : 'Simpan Data Barang'}
        </motion.button>
      </motion.form>
    </div>
  );
}
