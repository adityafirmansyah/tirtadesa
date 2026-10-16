import Dexie, { type Table } from "dexie";

export interface CachedPelanggan {
  id: string;
  nomor_sr: string;
  nama_pelanggan: string;
  dusun_rt_rw: string;
  alamat: string;
  kategori_nama: string;
  meter_terakhir: number;
}

export interface OfflineMeterEntry {
  id?: number;
  pelanggan_id: string;
  nomor_sr: string;
  periode: string;
  meter_lalu: number;
  meter_kini: number;
  foto_bukti?: string;
  lat?: number;
  lon?: number;
  status: "pending" | "synced" | "failed";
  error_msg?: string;
  recorded_at: string;
}

export class TirtaDesaOfflineDB extends Dexie {
  pelanggan!: Table<CachedPelanggan>;
  meterQueue!: Table<OfflineMeterEntry>;

  constructor() {
    super("TirtaDesaOfflineDB");
    this.version(1).stores({
      pelanggan: "id, nomor_sr, dusun_rt_rw",
      meterQueue: "++id, pelanggan_id, nomor_sr, periode, status",
    });
  }
}

export const offlineDb = new TirtaDesaOfflineDB();
