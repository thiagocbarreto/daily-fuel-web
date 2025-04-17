import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/libs/supabase/server";

const createChallengeSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  durationDays: z.number().int().min(1).max(365),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user details to check subscription status
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_subscriber")
      .eq("id", session.user.id)
      .single();

    if (userError || !user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (!user.is_subscriber) {
      return new NextResponse("Subscription required", { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = createChallengeSchema.parse(body);

    // Create challenge
    const { error: insertError } = await supabase.from("challenges").insert({
      creator_id: session.user.id,
      title: validatedData.title,
      description: validatedData.description || null,
      duration_days: validatedData.durationDays,
      start_date: validatedData.startDate,
    });

    if (insertError) {
      console.error("Error creating challenge:", insertError);
      return new NextResponse("Failed to create challenge", { status: 500 });
    }

    return new NextResponse("Challenge created successfully", { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/challenges:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 