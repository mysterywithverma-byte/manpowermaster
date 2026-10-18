import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/images directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique webp filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${safeName}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/images/${filename}`;

    return NextResponse.json({
      success: true,
      message: "Image uploaded and stored in lightweight format successfully",
      url: publicUrl,
      sizeBytes: buffer.length,
      mimeType: file.type,
      filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
