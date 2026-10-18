/**
 * Client-side lightweight image converter & compressor
 * Converts any heavy JPEG/PNG from camera/phone into ultra-lightweight WebP format (<50KB)
 * 100% Free - uses native browser Canvas API with zero server load and zero external dependencies
 */

export interface CompressionResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  format: "image/webp";
}

export async function compressImageToWebP(
  file: File,
  maxDimension: number = 800,
  quality: number = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not a valid image"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image into canvas"));
      img.onload = () => {
        // Calculate new dimensions preserving aspect ratio
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context could not be created"));
          return;
        }

        // Draw and compress to WebP
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to generate WebP image"));
              return;
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], cleanName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL("image/webp", quality);
            const originalSize = file.size;
            const compressedSize = blob.size;
            const savingsPercent = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize,
              compressedSize,
              savingsPercent,
              format: "image/webp",
            });
          },
          "image/webp",
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
