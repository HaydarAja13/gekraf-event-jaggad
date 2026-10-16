import path from "node:path";
import { getAdmin } from "@/lib/auth";
import { orderById, readProof } from "@/lib/sales";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return new Response("Login dulu.", { status: 401 });
  const { id } = await params;
  const order = await orderById(id);
  if (!order || !/^[\w.-]+$/.test(order.proofFile)) return new Response("Tidak ada.", { status: 404 });
  const bytes = await readProof(order.proofFile);
  if (!bytes) return new Response("Tidak ada.", { status: 404 });
  const ext = path.extname(order.proofFile).toLowerCase();
  return new Response(new Uint8Array(bytes), { headers: { "Content-Type": types[ext] ?? "application/octet-stream" } });
}
