import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://amxrxncjcbknujjyxfuc.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_LFhc7x7XhdqaCYKqGCZ3zA_hOAhsXo8";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  url: string;
  provider: "supabase" | "local" | "base64";
  fileName: string;
}

/**
 * Uploads a file (Resume PDF or Image) to Supabase Storage with local & serverless base64 fallback
 */
export async function uploadFileToCloud(
  buffer: Buffer,
  originalName: string,
  contentType: string = "application/octet-stream",
  bucket: "resumes" | "images" = "resumes"
): Promise<UploadResult> {
  const isImage = contentType.startsWith("image/") || bucket === "images";
  const cleanBase = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
  const ext = isImage ? ".webp" : path.extname(originalName) || (bucket === "resumes" ? ".pdf" : "");
  const uniqueName = `${Date.now()}_${cleanBase}${ext}`;
  const resolvedContentType = isImage ? "image/webp" : contentType;

  // 1. Try uploading to Supabase Storage
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueName, buffer, {
        contentType: resolvedContentType,
        upsert: true,
      });

    if (!error && data) {
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniqueName);

      if (publicData?.publicUrl) {
        return {
          url: publicData.publicUrl,
          provider: "supabase",
          fileName: uniqueName,
        };
      }
    }
  } catch (err) {
    console.warn("Supabase upload notice (trying local/serverless fallback):", err);
  }

  // 2. High-reliability fallback to local Next.js static uploads (writable container / local dev)
  const uploadSubdir = bucket === "images" ? "images" : "resumes";
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", uploadSubdir);
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    return {
      url: `/uploads/${uploadSubdir}/${uniqueName}`,
      provider: "local",
      fileName: uniqueName,
    };
  } catch (fsErr: any) {
    // 3. SERVERLESS / VERCEL FALLBACK: Prevents "EROFS: read-only file system"
    // In Vercel / AWS Lambda, /var/task/public is strictly read-only.
    // Return an instant, lightweight Base64 data URL that renders perfectly everywhere without disk writes.
    console.warn(
      `Filesystem is read-only (${fsErr?.code || "EROFS"}). Falling back to self-contained Base64 Data URL.`
    );

    const base64String = buffer.toString("base64");
    const dataUrl = `data:${resolvedContentType};base64,${base64String}`;

    return {
      url: dataUrl,
      provider: "base64",
      fileName: uniqueName,
    };
  }
}
