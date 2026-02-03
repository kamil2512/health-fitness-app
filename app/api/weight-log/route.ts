import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("weight_log")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(90);

    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch weight log" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weight_kg, date, notes } = await request.json();

    const { data, error } = await supabase
      .from("weight_log")
      .upsert(
        {
          user_id: user.id,
          weight_kg,
          date: date || new Date().toISOString().split("T")[0],
          notes: notes || null,
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to log weight" },
      { status: 500 }
    );
  }
}
