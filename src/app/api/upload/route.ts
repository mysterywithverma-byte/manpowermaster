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

    // Size limit: 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 5MB limit. Please upload a smaller file." },
        { status: 400 }
      );
    }

    // Determine target bucket & validate type
    const isImage = file.type.startsWith("image/") || bucketType === "image";
    const bucket = isImage ? "images" : "resumes";

    if (!isImage) {
      const allowedDocTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const isAllowedExt = /\.(pdf|docx?)$/i.test(file.name);
      if (!allowedDocTypes.includes(file.type) && !isAllowedExt) {
        return NextResponse.json(
          { success: false, error: "Invalid resume format. Only PDF, DOC, and DOCX files are allowed." },
          { status: 400 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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
