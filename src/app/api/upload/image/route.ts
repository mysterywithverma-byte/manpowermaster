import { NextRequest, NextResponse } from "next/server";
import { uploadFileToCloud } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const contentTypeHeader = request.headers.get("content-type") || "";

    let buffer: Buffer;
    let fileName = "image.webp";
    let mimeType = "image/webp";

    if (contentTypeHeader.includes("application/json")) {
      const json = await request.json();
      if (json.dataUrl) {
        const matches = json.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], "base64");
          fileName = json.fileName || "compressed.webp";
        } else {
          return NextResponse.json({ success: false, error: "Invalid dataUrl format" }, { status: 400 });
        }
      } else {
        return NextResponse.json({ success: false, error: "No dataUrl provided" }, { status: 400 });
      }
    } else {
      const data = await request.formData();
      const file = data.get("file") as File | null;
      const dataUrl = data.get("dataUrl") as string | null;

      if (dataUrl) {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], "base64");
          fileName = "compressed.webp";
        } else {
          return NextResponse.json({ success: false, error: "Invalid dataUrl in form" }, { status: 400 });
        }
      } else if (file) {
        const bytes = await file.arrayBuffer();
        buffer = Buffer.from(bytes);
        fileName = file.name;
        mimeType = file.type || "image/webp";
      } else {
        return NextResponse.json({ success: false, error: "No image file uploaded" }, { status: 400 });
      }
    }

    const uploadResult = await uploadFileToCloud(buffer, fileName, mimeType, "images");

    return NextResponse.json({
      success: true,
      message: "Image uploaded and stored in lightweight format successfully",
      url: uploadResult.url,
      provider: uploadResult.provider,
      sizeBytes: buffer.length,
      mimeType,
      filename: uploadResult.fileName,
    });
  } catch (error: unknown) {
    console.error("Image upload error:", error);
    const message = error instanceof Error ? error.message : "Image upload failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
