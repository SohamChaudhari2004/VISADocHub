/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchUsers(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/admin/users`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.value || []);
}

export async function fetchDocuments(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/admin/documents`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  // PowerShell/some clients might wrap it or the backend returns it directly. Check if it's an array.
  return Array.isArray(data) ? data : (data.value || []);
}

export async function fetchVerifications(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/admin/verifications`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch verifications");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.value || []);
}

export async function fetchDS160Forms(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/admin/ds160`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch DS-160 forms");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.value || []);
}
