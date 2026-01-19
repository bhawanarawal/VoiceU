import { useState, useEffect } from "react";
import api from "../../utils/api";

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
  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes, meRes] = await Promise.all([
          api.get("/auth/users"),
          api.get("/auth/roles"),
          api.get("/auth/users/me"),
        ]);

        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
        setCurrentUserRoles(meRes.data?.roles || []);
      } catch (err: any) {
        if (err.response?.status === 401) {
          window.location.href = "/signin";
        }
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isSuperAdmin = currentUserRoles.includes("superadmin");

  const openModal = (user: User) => {
    setEditingUser(user);
    setSelectedRoles(user.roles);
  };

  const closeModal = () => {
    setEditingUser(null);
    setSelectedRoles([]);
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    );
  };

  const saveRole = async () => {
    if (!editingUser) return;

    try {
      await api.post("/auth/assign-role", {
        user_id: editingUser.user_id,
        role_names: selectedRoles,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editingUser.user_id
            ? { ...u, roles: selectedRoles }
            : u,
        ),
      );

      closeModal();
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert("You are not allowed to assign roles");
      }
      console.error(err);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading users...</p>;
  }

  return (
    <div className="p-6 lg:p-6">
      <h2 className="text-2xl font-semibold mb-4">Users</h2>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px] border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow className="bg-gray-100 dark:bg-gray-900">
                <TableCell isHeader className="px-6 py-4 text-left">
                  ID
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left">
                  Email
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left">
                  Name
                </TableCell>
                <TableCell isHeader className="px-6 py-4 text-left">
                  Roles
                </TableCell>
                {isSuperAdmin && (
                  <TableCell isHeader className="px-6 py-4  text-left">
                    Action
                  </TableCell>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.user_id}
                  className="bg-white dark:bg-gray-900 rounded-lg"
                >
                  <TableCell className="px-6 py-4 text-sm">
                    {user.user_id}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm">
                    {user.email}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm font-medium">
                    {user.full_name || "-"}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {user.roles.length ? (
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
                    {isSuperAdmin && (
                      <Button size="sm" onClick={() => openModal(user)}>
                        Assign Roles
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingUser && isSuperAdmin && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96 ">
            <h3 className="text-lg font-semibold mb-4">
              Assign Roles for {editingUser.username}
            </h3>

            <div className="space-y-2 mb-6">
              {roles.map((role) => (
                <label
                  key={role.role_id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.name)}
                    onChange={() => toggleRole(role.name)}
                  />
                  {role.name}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal}>
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
