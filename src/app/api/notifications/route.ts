import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/lib/models/Notification";
import { User } from "@/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json({ success: true, count: 0, data: [] });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: true,
        unreadCount: 0,
        count: 0,
        data: [],
      });
    }

    // Query by userId or by candidate email (finding user ID first if needed)
    let targetIds: string[] = [];
    if (userId) targetIds.push(userId);

    if (email) {
      targetIds.push(email);
      try {
        const userDoc = await User.findOne({ email }).select("_id").lean();
        if (userDoc && (userDoc as any)._id) {
          targetIds.push((userDoc as any)._id.toString());
        }
      } catch {
        // fallback
      }
    }

    const query = { userId: { $in: targetIds } };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (err: any) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAll, userId } = body;

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ success: true, message: "Acknowledged (in-memory mode)" });
    }

    if (markAll && userId) {
      await Notification.updateMany({ userId }, { $set: { read: true } });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { $set: { read: true } });
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
