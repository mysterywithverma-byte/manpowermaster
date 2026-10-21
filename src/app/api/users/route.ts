import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { inMemoryStore } from "@/lib/mock-data";
import { escapeRegex } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const isVerifiedParam = searchParams.get("isVerified");
    const isVerified = isVerifiedParam !== null ? isVerifiedParam === "true" : undefined;

    const db = await connectToDatabase();

    if (db) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {};

      if (role && role !== "all") {
        query.role = role;
      }

      if (isVerified !== undefined) {
        query.isVerified = isVerified;
      }

      if (search) {
        const escaped = escapeRegex(search.trim());
        query.$or = [
          { name: { $regex: escaped, $options: "i" } },
          { email: { $regex: escaped, $options: "i" } },
          { companyName: { $regex: escaped, $options: "i" } },
        ];
      }

      const users = await User.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({
        success: true,
        count: users.length,
        source: "mongodb",
        users,
      });
    }

    // In-memory fallback
    const users = inMemoryStore.getUsers({
      search,
      role: role && role !== "all" ? role : undefined,
      isVerified,
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      source: "in-memory",
      users,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
