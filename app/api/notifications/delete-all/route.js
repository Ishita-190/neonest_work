import { NextResponse } from 'next/server';
import Vaccine from '@/app/models/Vaccine.model';
import connectDB from '@/lib/connectDB';
import { authenticateToken } from '@/lib/auth';

await connectDB();

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
