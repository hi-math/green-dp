import { NextResponse } from "next/server";
import { getFirebaseAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Firebase Admin 미설정: FIREBASE_ADMIN_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY를 설정하거나 Firestore Rules에서 schools 읽기를 허용하세요.",
      },
      { status: 501 },
    );
  }

  try {
    const db = getFirebaseAdminDb();
    const snap = await db.collection("schools").select("name").get();
    const items = snap.docs.map((d) => {
      const data = d.data() as any;
      const label = typeof data?.name === "string" && data.name.trim() ? data.name.trim() : d.id;
      return { id: d.id, label };
    });

    // locale-aware sort (Korean first)
    items.sort((a, b) => a.label.localeCompare(b.label, "ko"));

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown error" },
      { status: 500 },
    );
  }
}


