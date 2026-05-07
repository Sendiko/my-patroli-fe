'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  User,
  Archive,
  Tag,
  Hash,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ItemDetail {
  id: number;
  deskripsi: string;
  ditemukan_oleh?: string;
  sumber_lokasi?: string;
  status: 'belum_diambil' | 'sudah_diambil';
  foto_url?: string;
  tanggal_waktu: string;
  detail_penyimpanan?: string;
  kategori?: {
    nama_kategori: string;
  };
  laboratorium?: {
    kode_lab: string;
    nama_lab: string;
  };
  lokasiPenyimpanan?: {
    nama_lokasi: string;
  };
}

const labelDitemukanOleh: Record<string, string> = {
  asisten_laboratorium: 'Asisten Laboratorium',
  cleaning_service: 'Cleaning Service',
  mahasiswa: 'Mahasiswa',
  laboratorium: 'Laboratorium',
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value}</span>
      </div>
    </div>
  );
}

export default function DetailBarangPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await apiFetch(`/barang/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setItem(data.data || data);
        } else {
          setError('Barang tidak ditemukan.');
        }
      } catch {
        setError('Gagal memuat data barang.');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchItem();
  }, [params.id]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

  const ditemukanOlehRaw = item?.ditemukan_oleh || item?.sumber_lokasi || '-';
  const ditemukanOlehLabel = labelDitemukanOleh[ditemukanOlehRaw] ?? ditemukanOlehRaw;

  const formattedDate = item?.tanggal_waktu
    ? new Date(item.tanggal_waktu).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-primary text-3xl"
        >
          ◌
        </motion.div>
        <p className="text-sm">Memuat detail barang...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
        <Package size={48} className="text-gray-300" strokeWidth={1.5} />
        <p className="text-gray-500">{error || 'Barang tidak ditemukan.'}</p>
        <Link href="/" className="text-primary text-sm font-medium hover:underline">
          ← Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Detail Barang</h1>
        <span
          className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
            item.status === 'sudah_diambil'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {item.status === 'sudah_diambil' ? 'Sudah Diambil' : 'Belum Diambil'}
        </span>
      </header>

      <main className="flex-1 pb-8">
        {/* Foto */}
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full aspect-[4/3] bg-gray-100 overflow-hidden relative"
        >
          {item.foto_url ? (
            <img
              src={`${apiBase}${item.foto_url}`}
              alt={item.kategori?.nama_kategori || 'Foto barang'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
              <Package size={64} strokeWidth={1} />
              <span className="text-sm">Tidak ada foto</span>
            </div>
          )}
          {/* Status overlay */}
          <div
            className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
              item.status === 'sudah_diambil'
                ? 'bg-green-500/90 text-white'
                : 'bg-amber-400/90 text-white'
            }`}
          >
            {item.status === 'sudah_diambil' ? (
              <CheckCircle size={13} />
            ) : (
              <Clock size={13} />
            )}
            {item.status === 'sudah_diambil' ? 'Diambil' : 'Belum Diambil'}
          </div>
        </motion.div>

        {/* Kategori & ID */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white px-4 pt-5 pb-4 border-b border-gray-100"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {item.kategori?.nama_kategori || 'Tanpa Kategori'}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
            <Hash size={11} />
            ID Barang: {item.id}
          </p>
        </motion.div>

        {/* Info Penemuan */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white mx-0 mt-3 px-4 pt-2 pb-0 shadow-sm"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-3 border-b border-gray-100">
            Informasi Penemuan
          </p>
          <InfoRow
            icon={User}
            label="Ditemukan Oleh"
            value={ditemukanOlehLabel}
          />
          {item.laboratorium && (
            <InfoRow
              icon={MapPin}
              label="Laboratorium"
              value={`${item.laboratorium.kode_lab} – ${item.laboratorium.nama_lab}`}
            />
          )}
          <InfoRow
            icon={Calendar}
            label="Tanggal & Waktu"
            value={formattedDate}
          />
        </motion.div>

        {/* Info Penyimpanan */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white mx-0 mt-3 px-4 pt-2 pb-0 shadow-sm"
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider py-3 border-b border-gray-100">
            Informasi Penyimpanan
          </p>
          <InfoRow
            icon={Archive}
            label="Lokasi Penyimpanan"
            value={item.lokasiPenyimpanan?.nama_lokasi || '-'}
          />
          {item.detail_penyimpanan && (
            <InfoRow
              icon={Tag}
              label="Detail Penyimpanan"
              value={item.detail_penyimpanan}
            />
          )}
        </motion.div>

        {/* Deskripsi */}
        {item.deskripsi && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white mx-0 mt-3 px-4 py-4 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Deskripsi Barang
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {item.deskripsi}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
