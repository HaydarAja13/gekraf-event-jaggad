import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  // Preview/branch deployment punya URL acak sendiri. Jangan sampai versi
  // setengah jadi ikut masuk indeks Google dan menyaingi domain produksi.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    response.headers.set("x-robots-tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
