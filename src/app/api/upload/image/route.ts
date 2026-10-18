import { NextRequest, NextResponse } from "next/server";
import { uploadFileToCloud } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadFileToCloud(
      buffer,
      file.name,
      file.type || "image/webp",
      "images"
    );

    return NextResponse.json({
      success: true,
      message: "Image uploaded and stored in lightweight format successfully",
      url: uploadResult.url,
      provider: uploadResult.provider,
      sizeBytes: buffer.length,
      mimeType: file.type,
      filename: uploadResult.fileName,
    });
  } catch (error: unknown) {
    console.error("Image upload error:", error);
    const message = error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
