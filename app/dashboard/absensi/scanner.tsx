"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { scanCheckInAction, type ScanCheckInResult } from "@/lib/actions";
import { toast } from "@/app/toast";
import { Icon, btnClass, inputClass } from "../ui";

/* Pemindai kehadiran. Kamera hanya hidup saat panel terbuka, satu kode dijawab
   lalu diberi jeda supaya frame berikutnya tidak menandai orang yang sama
   berulang kali. Tanpa kamera (ditolak / tidak ada) admin tinggal mengetik. */

type Status = { tone: "ok" | "warn" | "off"; text: string; name?: string } | null;

const COOLDOWN_MS = 2500;

function beep(ok: boolean) {
  try {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Context();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 1180 : 320;
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (ok ? 0.16 : 0.3));
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.17 : 0.31));
    osc.onended = () => ctx.close();
  } catch {
    /* audio hanya pelengkap */
  }
}

export function QrScanner() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const busyRef = useRef(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const handle = useCallback(async (payload: string) => {
    const code = payload.trim();
    if (!code || busyRef.current) return;
    const now = Date.now();
    if (lastRef.current.code === code && now - lastRef.current.at < COOLDOWN_MS) return;
    lastRef.current = { code, at: now };

    busyRef.current = true;
    setBusy(true);
    const result: ScanCheckInResult = await scanCheckInAction(code);
    busyRef.current = false;
    setBusy(false);

    if (!result.ok) {
      beep(false);
      setStatus({ tone: "off", text: result.error });
      toast("off", result.error);
      return;
    }
    beep(true);
    if (result.already) {
      const text = `${result.name} sudah tercatat hadir sebelumnya.`;
      setStatus({ tone: "warn", text, name: result.name });
      toast("warn", text);
      return;
    }
    const text = `${result.name} ditandai hadir · ${result.plan}`;
    setStatus({ tone: "ok", text, name: result.name });
    toast("ok", text);
    // Segarkan tabel & hitungan lewat RSC tanpa memuat ulang halaman, supaya
    // toast tetap terlihat dan filter pencarian tidak hilang. Parameter `scan`
    // menyorot baris peserta yang baru dicheck-in.
    const url = new URL(window.location.href);
    url.searchParams.set("scan", result.ticketNo);
    router.replace(url.pathname + url.search, { scroll: false });
    router.refresh();
  }, [router]);

  async function start() {
    setOpen(true);
    setStatus(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus({ tone: "off", text: "Kamera tidak tersedia di peramban ini. Gunakan input manual di bawah." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      const loop = () => {
        if (!canvas || !ctx || !video.videoWidth) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        if (video.videoWidth !== canvas.width || video.videoHeight !== canvas.height) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const found = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, {
          inversionAttempts: "dontInvert",
        });
        if (found?.data) void handle(found.data);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setStatus({
        tone: "off",
        text: "Kamera tidak bisa dibuka (izin ditolak atau sedang dipakai aplikasi lain). Ketik nomor tiket manual.",
      });
    }
  }

  function close() {
    setOpen(false);
    stop();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {!open ? (
          <button type="button" onClick={start} className={btnClass("primary", "md", "gap-2")}>
            <Icon name="camera" className="h-4 w-4" />
            Buka pemindai QR
          </button>
        ) : (
          <button type="button" onClick={close} className={btnClass("outline", "md", "gap-2")}>
            <Icon name="x" className="h-4 w-4" />
            Matikan kamera
          </button>
        )}
        {busy ? (
          <span className="flex items-center gap-2 text-[12.5px] font-medium text-dash-muted">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-dash-muted border-r-transparent" />
            Memeriksa tiket…
          </span>
        ) : null}
      </div>

      {open ? (
        <div className="overflow-hidden rounded-[12px] border border-dash-line bg-dash-bg">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md bg-dash-ink">
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="h-44 w-44 rounded-[14px] border-2 border-white/70 shadow-[0_0_0_9999px_rgba(2,17,24,0.45)]" />
            </div>
            <p className="absolute inset-x-0 bottom-0 bg-dash-ink/70 px-3 py-2 text-center text-[12.5px] font-medium text-white">
              Arahkan kamera ke QR pada tiket peserta
            </p>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handle(manual);
          setManual("");
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <label className="min-w-56 flex-1 sm:max-w-xs">
          <span className="text-[13px] font-semibold text-dash-ink">Input manual no. tiket</span>
          <input
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            placeholder="BSM-0001"
            className={`${inputClass} font-mono`}
            autoComplete="off"
          />
        </label>
        <button type="submit" disabled={!manual.trim()} className={btnClass("outline", "md", "gap-2")}>
          <Icon name="check" className="h-4 w-4" />
          Tandai hadir
        </button>
      </form>

      {status ? (
        <p
          role={status.tone === "off" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium ${
            status.tone === "ok"
              ? "bg-dash-ok-bg text-dash-ok-fg"
              : status.tone === "warn"
                ? "bg-dash-warn-bg text-dash-warn-fg"
                : "bg-dash-off-bg text-dash-off-fg"
          }`}
        >
          <Icon name={status.tone === "ok" ? "checkCircle" : status.tone === "warn" ? "info" : "alert"} className="mt-0.5 h-4 w-4" />
          <span>{status.text}</span>
        </p>
      ) : null}
    </div>
  );
}
