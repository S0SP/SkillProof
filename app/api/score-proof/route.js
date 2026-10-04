import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { assessmentId, imageBase64, skipped } = body;

    if (skipped) {
      const proofResult = {
        assessment_id: assessmentId,
        skipped: true,
        ai_marks: 0,
        notes: "Proof skipped by worker."
      };
      const { data, error } = await supabase
        .from('proofs')
        .insert(proofResult)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: data });
    }

    let fileUrl = null;
    if (imageBase64) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `proof_${Date.now()}.jpg`;

        const { error: storageError } = await supabase.storage
          .from('proofs')
          .upload(filename, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (!storageError) {
          const { data: publicUrlData } = supabase.storage.from('proofs').getPublicUrl(filename);
          fileUrl = publicUrlData.publicUrl;
        } else {
          console.warn("Storage upload failed (bucket proofs might need public policy):", storageError.message);
          fileUrl = imageBase64.length > 50000 ? null : imageBase64;
        }
      } catch (err) {
        console.error("Storage error:", err);
      }
    }

    const proofResult = {
      assessment_id: assessmentId,
      file_url: fileUrl,
      skipped: false,
      ai_marks: 15,
      good_points: ["Neat wiring", "Correct tools used"],
      problems: ["Minor insulation issue visible"],
      notes: "Electrical work is good but ensure proper insulation on all joints."
    };

    const { data, error } = await supabase
      .from('proofs')
      .insert(proofResult)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
