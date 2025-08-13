// app/api/notifications/delete-all/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";

export async function DELETE(request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Delete all notifications for the user
    const result = await db.collection("notifications").deleteMany({
      userId: session.user.id
    });

    return NextResponse.json({
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Alternative implementation if using Mongoose models
/*
import Notification from "../../../models/Notification";
import { connectDB } from "../../../lib/connectDB";

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const result = await Notification.deleteMany({
      userId: session.user.id
    });

    return NextResponse.json({
      message: "All notifications deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
*/
