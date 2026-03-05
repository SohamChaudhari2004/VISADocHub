/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchUsers } from "@/lib/api";

export default async function UsersPage() {
  const users = await fetchUsers().catch(() => []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Users</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage all registered users on the platform.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead className="bg-bg-base">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-white">
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              users.map((user: any) => (
                <tr key={user.id} className="hover:bg-bg-base/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">
                    {user.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {new Date(user.created_at).toLocaleString()}
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
