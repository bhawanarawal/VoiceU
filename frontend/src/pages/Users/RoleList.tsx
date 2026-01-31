import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import { getRoles, deleteRole } from "./roleService";

interface Role {
  role_id: number;
  name: string;
}

export default function RoleList() {
  const [data, setData] = useState<Role[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      const res = await getRoles();
      setData(res.data);
    } catch {
      setToast({ message: "Failed to fetch roles", type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id);
      setToast({ message: "Role deleted successfully", type: "success" });
      fetchData();
    } catch {
      setToast({ message: "Failed to delete role", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: { header: string; key: keyof Role }[] = [
    { header: "Role Name", key: "name" },
  ];

  return (
    <div className="p-5">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Roles</h2>
        <Link
          to="/dashboard/roles/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Role
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No roles found"
        renderActions={(role) => (
          <div className="flex gap-3">
            <button
              onClick={() =>
                setConfirmDelete({
                  id: role.role_id,
                  name: role.name,
                })
              }
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      />

      {confirmDelete && (
        <Modal
          isOpen
          onClose={() => setConfirmDelete(null)}
          className="max-w-md p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Delete Role</h3>
          <p className="mb-4">
            Are you sure you want to delete "{confirmDelete.name}"?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDelete(confirmDelete.id)}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
