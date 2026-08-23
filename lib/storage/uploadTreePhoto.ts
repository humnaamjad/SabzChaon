// Photo upload to Supabase Storage (§10.0).
// Firebase Storage is NOT used — only Supabase handles file storage (§7).
// The returned public URL is saved as `photoUrl` on the TreeUpdate document
// and passed into the AI analysis function.

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Uploads a tree photo to Supabase Storage and returns the public URL.
 * Bucket `tree-photos` must be set to "Public" in the Supabase dashboard.
 *
 * @param file - The photo file to upload
 * @param treeId - The tree's unique ID (used for folder organization)
 * @returns The public URL of the uploaded photo
 */
async function uploadTreePhoto(file: File, treeId: string): Promise<string> {
  const fileName = `${treeId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("tree-photos")
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("tree-photos")
    .getPublicUrl(fileName);

  return urlData.publicUrl; // pass this into analyzeTreePhoto({ photoUrl: ... })
}

export { uploadTreePhoto };
