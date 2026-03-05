import { fetchUsers, fetchDocuments, fetchVerifications, fetchDS160Forms } from "@/lib/api";

export default async function Dashboard() {
  let users = [];
  let documents = [];
  let verifications = [];
  let ds160Forms = [];

  try {
    [users, documents, verifications, ds160Forms] = await Promise.all([
      fetchUsers(),
      fetchDocuments(),
      fetchVerifications(),
      fetchDS160Forms(),
    ]);
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0f172a]">Dashboard</h1>
        <p className="text-sm text-[#475569] mt-1">
          Overview of VisaDocHub platform metrics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#16a34a]/30">
          <h3 className="text-sm font-medium text-[#475569]">Total Users</h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#16a34a]">{users.length}</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#16a34a]/30">
          <h3 className="text-sm font-medium text-[#475569]">Documents Uploaded</h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#16a34a]">{documents.length}</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#16a34a]/30">
          <h3 className="text-sm font-medium text-[#475569]">Verifications Run</h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#16a34a]">{verifications.length}</p>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#16a34a]/30">
          <h3 className="text-sm font-medium text-[#475569]">Generated DS-160s</h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#16a34a]">{ds160Forms.length}</p>
        </div>
      </div>
    </div>
  );
}
