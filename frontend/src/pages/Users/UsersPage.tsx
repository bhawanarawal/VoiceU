import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
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
  const [selectedRole, setSelectedRole] = useState("");

  
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
    
    setSelectedRole(user.roles[0] || (roles.length > 0 ? roles[0].name : ""));
  };

  const closeModal = () => setEditingUser(null);

  const saveRole = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: editingUser.user_id,
          role_name: selectedRole,
        }),
      });

      if (!res.ok) throw new Error("Failed to assign role");

      
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editingUser.user_id ? { ...u, roles: [selectedRole] } : u
        )
      );
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to assign role");
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
              <TableCell isHeader className="px-6 py-3 text-left">ID</TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">Email</TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">Username</TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">Role</TableCell>
              <TableCell isHeader className="px-6 py-3 text-left">Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="px-6 py-4">{user.user_id}</TableCell>
                <TableCell className="px-6 py-4">{user.email}</TableCell>
                <TableCell className="px-6 py-4">{user.full_name || "-"}</TableCell>
                <TableCell className="px-6 py-4">
                  <Badge color="primary">{user.roles[0] || "No Role"}</Badge>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Button size="sm" onClick={() => openModal(user)}>
                    Assign Role
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-4">
              Assign Role for {editingUser.full_name || editingUser.username}
            </h3>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            >
              {roles.map((role) => (
                <option key={role.role_id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
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
