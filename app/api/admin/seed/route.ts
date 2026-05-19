import { seedFirestore } from "@/lib/firestore-helpers";
import { NextRequest, NextResponse } from "next/server";

// Only allow seeding in development or with a secret key
export async function POST(request: NextRequest) {
  try {
    // Optional: Add security check (e.g., API key verification)
    const authHeader = request.headers.get("authorization");
    const secretKey = process.env.SEED_SECRET_KEY;

    if (secretKey && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedFirestore();
    return NextResponse.json(
      { success: true, message: "Seed data initialized successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error: "Failed to seed database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
