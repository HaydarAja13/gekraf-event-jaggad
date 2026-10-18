import { metaPixelId } from "@/lib/meta";
import { MetaPixel } from "./meta-pixel";

export async function MetaGate() {
  const pixelId = await metaPixelId();
  if (!pixelId) return null;
  return <MetaPixel pixelId={pixelId} />;
}
