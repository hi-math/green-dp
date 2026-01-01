import { NextResponse } from "next/server";
import { getFirebaseAdminDb, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ schoolId: string }> }) {
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

  const { schoolId } = await ctx.params;
  const id = decodeURIComponent(schoolId);

  try {
    const db = getFirebaseAdminDb();
    const ref = db.collection("schools").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
    }

    const data = snap.data() ?? {};
    return NextResponse.json({ ok: true, id: snap.id, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "unknown error" },
      { status: 500 },
    );
  }
}


