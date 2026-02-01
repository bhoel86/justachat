import { useEffect, useState } from "react";

type CutoutOptions = {
  /**
   * How close a pixel must be to "near-white" to be treated as background.
   * Higher = more aggressive removal.
   */
  nearWhiteMin?: number; // 0-255
  /**
   * Max channel difference (R/G/B) to be considered "neutral" (not saturated).
   */
  neutralMaxDelta?: number; // 0-255
  /** Padding (in pixels) around the trimmed bounds */
  padding?: number;
};

const defaultOpts: Required<CutoutOptions> = {
  nearWhiteMin: 232,
  neutralMaxDelta: 10,
  padding: 12,
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Turns a "fake transparent" PNG (checkerboard baked into pixels) into a real cutout:
 * - makes near-white neutral pixels fully transparent
 * - auto-trims to non-transparent bounds + padding
 */
export function usePngCutout(src?: string, options?: CutoutOptions) {
  const [cutoutSrc, setCutoutSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setCutoutSrc(null);
      return;
    }

    const opts = { ...defaultOpts, ...(options ?? {}) };
    let cancelled = false;

    const run = async () => {
      const img = new Image();
      img.decoding = "async";
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = src;
      });

      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) return;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // 1) Remove near-white neutral pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        const nearWhite = r >= opts.nearWhiteMin && g >= opts.nearWhiteMin && b >= opts.nearWhiteMin;
        const neutral = max - min <= opts.neutralMaxDelta;

        if (nearWhite && neutral) {
          data[i + 3] = 0; // alpha
        }
      }

      // 2) Find non-transparent bounds
      let minX = w,
        minY = h,
        maxX = -1,
        maxY = -1;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const a = data[idx + 3];
          if (a > 0) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If we didn't find anything, bail out to original
      if (maxX < 0 || maxY < 0) {
        if (!cancelled) setCutoutSrc(null);
        return;
      }

      const pad = opts.padding;
      minX = clamp(minX - pad, 0, w - 1);
      minY = clamp(minY - pad, 0, h - 1);
      maxX = clamp(maxX + pad, 0, w - 1);
      maxY = clamp(maxY + pad, 0, h - 1);

      const outW = maxX - minX + 1;
      const outH = maxY - minY + 1;

      // Put alpha-adjusted pixels back
      ctx.putImageData(imageData, 0, 0);

      // 3) Crop to bounds
      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      const outCtx = outCanvas.getContext("2d");
      if (!outCtx) return;
      outCtx.clearRect(0, 0, outW, outH);
      outCtx.drawImage(canvas, minX, minY, outW, outH, 0, 0, outW, outH);

      const out = outCanvas.toDataURL("image/png");
      if (!cancelled) setCutoutSrc(out);
    };

    run().catch(() => {
      if (!cancelled) setCutoutSrc(null);
    });

    return () => {
      cancelled = true;
    };
  }, [src, options?.nearWhiteMin, options?.neutralMaxDelta, options?.padding]);

  return cutoutSrc;
}
