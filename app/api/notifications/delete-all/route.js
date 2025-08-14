import { NextResponse } from "next/server";
import Notification from "@/app/models/Notification.model";
import connectDB from "@/lib/connectDB";
import { authenticateToken } from "@/lib/auth";

export async function DELETE(request) {
  try {
    await connectDB();

    const user = await authenticateToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await Notification.deleteMany({ userId: user.id });

    return NextResponse.json({
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
