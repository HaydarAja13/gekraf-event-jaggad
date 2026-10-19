export type WaTicket = {
  fullName: string;
  plan: string;
  ticketNo: string;
  event: string;
  when: string;
  where: string;
  pageUrl: string;
};

/** Nomor Indonesia ke format internasional tanpa spasi/tanda baca, mis.
 *  "0822-4198-9936" -> "6282241989936". Null kalau nomornya tidak masuk akal. */
export function waNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

/** Tiket versi teks (tanpa lampiran/HTML) untuk dikirim lewat WhatsApp. */
export function waTicketMessage(input: WaTicket) {
  return [
    `*E-TIKET RESMI — ${input.event}*`,
    "",
    `Halo ${input.fullName}, pembayaran paket ${input.plan} sudah kami terima dan terkonfirmasi.`,
    "Berikut e-tiket Anda:",
    "",
    `Nomor tiket: ${input.ticketNo}`,
    `Nama: ${input.fullName}`,
    `Paket: ${input.plan}`,
    `Waktu: ${input.when}`,
    `Tempat: ${input.where}`,
    "",
    "Buka tiket digital (QR check-in):",
    input.pageUrl,
    "",
    "Tunjukkan nomor tiket atau QR pada tautan di atas ke meja registrasi. Simpan pesan ini.",
  ].join("\n");
}

/** Tautan wa.me dengan teks tiket yang sudah di-encode. Null kalau nomor
 *  peserta tidak bisa dipakai, supaya tombolnya tidak menuju chat kosong. */
export function waTicketUrl(raw: string, input: WaTicket) {
  const number = waNumber(raw);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(waTicketMessage(input))}`;
}
