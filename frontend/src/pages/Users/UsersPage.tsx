import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name?: string;
  roles: string[];
}

interface Role {
  role_id: number;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/auth/users"),
          fetch("http://127.0.0.1:8000/auth/roles"),
        ]);
        const usersData = await usersRes.json();
        const rolesData = await rolesRes.json();
        setUsers(usersData);
        setRoles(rolesData);
      } catch (err) {
        console.error("Error fetching users or roles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openModal = (user: User) => {
    setEditingUser(user);

    setSelectedRoles(user.roles);
  };

  const closeModal = () => setEditingUser(null);

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const saveRole = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUser.user_id,
          role_names: selectedRoles,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign role");

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editingUser.user_id ? { ...u, roles: selectedRoles } : u
        )
      );

      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to assign roles");
    }
  };

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6 lg:p-10">
      <h2 className="text-2xl font-semibold mb-6">Users</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableCell isHeader className="px-6 py-3 text-left">
                ID
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">
                Email
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">
                Username
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">
                Roles
              </TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.user_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <TableCell className="px-6 py-4">{user.user_id}</TableCell>
                <TableCell className="px-6 py-4">{user.email}</TableCell>
                <TableCell className="px-6 py-4">
                  {user.full_name || "-"}
                </TableCell>

                <TableCell className="px-6 py-4">
                  <div className="flex gap-2 flex-wrap">
                    {user.roles.length > 0 ? (
                      user.roles.map((r) => (
                        <Badge key={r} color="primary">
                          {r}
                        </Badge>
                      ))
                    ) : (
                      <Badge color="primary">No Role</Badge>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <Button size="sm" onClick={() => openModal(user)}>
                    Assign Roles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 max-w-full relative shadow-lg">
            <h3 className="text-lg font-semibold mb-6">
              Assign Roles for {editingUser.full_name || editingUser.username}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Select Roles
              </label>

              <div className="space-y-2">
                {roles.map((role) => (
                  <label key={role.role_id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.name)}
                      onChange={() => toggleRole(role.name)}
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={closeModal} variant="outline">
                Cancel
              </Button>
              <Button onClick={saveRole}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
