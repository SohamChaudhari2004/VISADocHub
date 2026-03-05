/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchVerifications } from "@/lib/api";

export default async function VerificationsPage() {
  const verifications = await fetchVerifications().catch(() => []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Verifications</h1>
        <p className="text-sm text-text-secondary mt-1">
          Review automated verification results and risk scores.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead className="bg-bg-base">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">User ID</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Risk Score</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Mismatches</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-white">
            {verifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-text-muted">
                  No verifications found.
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              verifications.map((v: any) => (
                <tr key={v.id} className="hover:bg-bg-base/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">{v.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{v.user_id}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      v.risk_score > 60 ? 'bg-red-100 text-red-800' :
                      v.risk_score > 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {v.risk_score.toFixed(1)} / 100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {v.mismatches && v.mismatches.length > 0 ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-800">
                        {v.mismatches.length} Issues
                      </span>
                    ) : (
                      <span className="text-text-muted">None</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
