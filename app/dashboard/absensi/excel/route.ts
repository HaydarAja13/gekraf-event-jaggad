import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { listAttendees } from "@/lib/sales";
import { orderStamp, todayLine } from "../../greeting";
import { applyAbsensi, readQuery } from "../query";

/* Unduh daftar absensi sebagai .xlsx. Mengikuti pencarian, filter, dan urutan
   yang sedang aktif di halaman, seharian hasilnya persis seperti yang terlihat. */

const HEADERS = [
  "No",
  "Nama",
  "No. Tiket",
  "Kategori Tiket",
  "Status Kehadiran",
  "Waktu Check-in",
  "Petugas",
  "Tgl. Pesan",
  "WhatsApp",
  "Email",
  "Instansi",
  "Jabatan",
] as const;

export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Login dulu." }, { status: 401 });

  const url = new URL(request.url);
  const query = readQuery(Object.fromEntries(url.searchParams));
  const attendees = await listAttendees();
  const rows = applyAbsensi(attendees, query);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = `Absensi · ${admin.username}`;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Absensi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Lebar kolom disetel lebih dulu sebelum baris data masuk.
  sheet.columns = [
    { key: "no", width: 6 },
    { key: "nama", width: 26 },
    { key: "tiket", width: 14 },
    { key: "kategori", width: 16 },
    { key: "kehadiran", width: 15 },
    { key: "waktu", width: 18 },
    { key: "petugas", width: 14 },
    { key: "tanggal", width: 16 },
    { key: "wa", width: 16 },
    { key: "email", width: 28 },
    { key: "instansi", width: 24 },
    { key: "jabatan", width: 20 },
  ];

  sheet.addRow(HEADERS as unknown as string[]);
  const header = sheet.getRow(1);
  header.height = 24;
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  header.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0299C3" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FF016A8C" } } };
  });

  rows.forEach((order, index) => {
    sheet.addRow([
      index + 1,
      order.fullName,
      order.ticketNo ?? "",
      order.plan,
      order.checkedInAt ? "Hadir" : "Belum hadir",
      order.checkedInAt ? orderStamp(order.checkedInAt) : "",
      order.checkedInBy ?? "",
      orderStamp(order.createdAt),
      order.whatsapp,
      order.email,
      order.institution,
      order.jobTitle,
    ]);
  });

  /* Baris terakhir: ringkasan kehadiran supaya rekap cepat terbaca. */
  const hadir = rows.filter((order) => order.checkedInAt).length;
  const summary = sheet.addRow([
    "",
    `Total: ${rows.length} peserta · Hadir: ${hadir} · Belum hadir: ${rows.length - hadir}`,
  ]);
  summary.font = { bold: true, size: 11 };
  summary.getCell(2).font = { bold: true, size: 11 };

  // Zebra + garis bawah tipis supaya enak dibaca saat dicetak.
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1 || rowNumber === summary.number) return;
    if (rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F7F9" } };
      });
    }
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "hair", color: { argb: "FFD8E2E7" } } };
      cell.alignment = { vertical: "middle" };
    });
  });

  // Autofilter hanya untuk baris data (kecuali ringkasan terakhir).
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, rows.length + 1), column: HEADERS.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const stamp = todayLine().replace(/[ ,]+/g, "-").toLowerCase();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="absensi-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
