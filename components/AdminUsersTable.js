import Avatar from "./Avatar";
import AdminRoleForm from "./AdminRoleForm";

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "Not provided";
}
function Identity({ user }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar
        initials={user.initials}
        src={user.avatarUrl}
        className="size-9 rounded-lg text-xs"
      />
      <div className="min-w-0">
        <p className="break-words font-semibold text-slate-900">{user.name}</p>
        <p className="mt-1 break-all text-xs text-slate-500">{user.email}</p>
      </div>
    </div>
  );
}
function Role({ role }) {
  return (
    <span
      className={`status-badge ${role === "admin" ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}
    >
      {role === "admin" ? "Administrator" : "Member"}
    </span>
  );
}
export default function AdminUsersTable({ users, currentAdminId }) {
  return (
    <>
      <div className="surface-card hidden overflow-hidden xl:block">
        <table className="data-table table-fixed">
          <caption className="sr-only">
            Registered users and protected role management
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[30%]">
                Member
              </th>
              <th scope="col" className="w-[23%]">
                Campus information
              </th>
              <th scope="col" className="w-[17%]">
                Joined
              </th>
              <th scope="col" className="w-[30%]">
                Access & role
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <Identity user={user} />
                </td>
                <td>
                  <p className="break-words font-medium text-slate-700">
                    {user.department || "No department"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {user.campusId || "No campus ID"}
                  </p>
                </td>
                <td className="text-xs text-slate-500">
                  {formatDate(user.createdAt)}
                </td>
                <td>
                  <Role role={user.role} />
                  <AdminRoleForm
                    currentRole={user.role}
                    isCurrentAdmin={user.id === currentAdminId}
                    userId={user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:hidden">
        {users.map((user) => (
          <article key={user.id} className="surface-card min-w-0 p-5">
            <Identity user={user} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Role role={user.role} />
              <span className="text-xs text-slate-500">
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
            <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Campus ID</dt>
                <dd className="break-words text-right font-medium">
                  {user.campusId || "Not provided"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Department</dt>
                <dd className="break-words text-right font-medium">
                  {user.department || "Not provided"}
                </dd>
              </div>
            </dl>
            <AdminRoleForm
              currentRole={user.role}
              isCurrentAdmin={user.id === currentAdminId}
              userId={user.id}
            />
          </article>
        ))}
      </div>
    </>
  );
}
