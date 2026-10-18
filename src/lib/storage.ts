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
  provider: "supabase" | "local";
  fileName: string;
}

/**
 * Uploads a file (Resume PDF or Image) to Supabase Storage with local fallback
 */
export async function uploadFileToCloud(
  buffer: Buffer,
  originalName: string,
  contentType: string = "application/octet-stream",
  bucket: "resumes" | "images" = "resumes"
): Promise<UploadResult> {
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueName = `${Date.now()}_${cleanName}`;

  // 1. Try uploading to Supabase Storage
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueName, buffer, {
        contentType,
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
    console.warn("Supabase upload notice (falling back to local storage):", err);
  }

  // 2. High-reliability fallback to local Next.js static uploads
  const uploadSubdir = bucket === "images" ? "images" : "resumes";
  const uploadsDir = path.join(process.cwd(), "public", "uploads", uploadSubdir);
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, uniqueName);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${uploadSubdir}/${uniqueName}`,
    provider: "local",
    fileName: uniqueName,
  };
}
