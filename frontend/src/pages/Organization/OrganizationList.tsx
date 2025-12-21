import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import { getOrganizations, deleteOrganization } from "./organizationService";

interface Organization {
  org_id: number;
  name: string;
  address?: string;
  description?: string;
}

export default function OrganizationList() {
  const [data, setData] = useState<Organization[]>([]);
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
      const res = await getOrganizations();
      setData(res.data);
    } catch {
      setToast({ message: "Failed to fetch organizations", type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteOrganization(id);
      setToast({
        message: "Organization deleted successfully",
        type: "success",
      });
      fetchData();
    } catch {
      setToast({ message: "Failed to delete organization", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: { header: string; key: keyof Organization }[] = [
    { header: "Name", key: "name" },
    { header: "Address", key: "address" },
    { header: "Description", key: "description" },
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
        <h2 className="text-xl font-semibold">Organizations</h2>
        <Link
          to="/organization/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Organization
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No organizations found"
        renderActions={(org) => (
          <div className="flex gap-3">
            <Link
              to={`/organization/edit/${org.org_id}`}
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() =>
                setConfirmDelete({ id: org.org_id, name: org.name })
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
          <h3 className="text-lg font-semibold mb-4">Delete Organization</h3>
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
