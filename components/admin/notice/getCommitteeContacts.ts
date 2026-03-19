import { supabase } from "@/lib/supabase";

export interface CommitteeContacts {
  president: string;
  secretary: string;
}

export async function getCommitteeContacts(): Promise<CommitteeContacts> {
  const { data, error } = await supabase
    .from("committee_members")
    .select("role_key, contact_number, display_order, created_at")
    .in("role_key", ["president", "secretary", "President", "Secretary"])
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch committee contacts", error);
    return {
      president: "+918547136339",
      secretary: "+919539516653",
    };
  }

  const presidentRow = data?.find(
    (item) => item.role_key?.toLowerCase?.() === "president"
  );
  const secretaryRow = data?.find(
    (item) => item.role_key?.toLowerCase?.() === "secretary"
  );

  return {
    president: presidentRow?.contact_number || "+918547136339",
    secretary: secretaryRow?.contact_number || "+919539516653",
  };
}