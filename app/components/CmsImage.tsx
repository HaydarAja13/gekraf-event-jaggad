import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src"> & { src: string };

export function CmsImage({ src, alt, fill, className, ...rest }: Props) {
  if (!src) return null;
  if (src.startsWith("http") && !src.includes("placehold.co")) {
    return (
      // Admin can paste any image URL; next/image only allows configured hosts.
      <img
        src={src}
        alt={alt}
        className={fill ? `absolute inset-0 h-full w-full ${className ?? ""}` : className}
      />
    );
  }
  return <Image src={src} alt={alt} fill={fill} className={className} {...rest} />;
}
