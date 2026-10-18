import { NextRequest, NextResponse } from "next/server";
import { uploadFileToCloud } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucketType = (formData.get("type") as string) || "";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine target bucket
    const isImage = file.type.startsWith("image/") || bucketType === "image";
    const bucket = isImage ? "images" : "resumes";

    const uploadResult = await uploadFileToCloud(
      buffer,
      file.name,
      file.type || (isImage ? "image/jpeg" : "application/pdf"),
      bucket
    );

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      url: uploadResult.url,
      provider: uploadResult.provider,
      message: `${isImage ? "Image" : "Resume"} successfully processed and stored!`,
    });
  } catch (error: unknown) {
    console.error("Upload handler error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
