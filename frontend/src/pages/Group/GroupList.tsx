import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import { getgroups, deletegroup } from "./groupService";
import { getOrganizations } from "../Organization/organizationService";

interface Group {
  group_id: number;
  group_name: string;
  is_active: boolean;
  org_id: number;
  organization_name?: string;
  description?: string;
}

interface Organization {
  org_id: number;
  name: string;
}

export default function GroupList() {
  const [data, setData] = useState<Group[]>([]);
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
      const [groupRes, orgRes] = await Promise.all([
        getgroups(),
        getOrganizations(),
      ]);

      const orgMap: Record<number, Organization> = {};
      orgRes.data.forEach((org: Organization) => {
        orgMap[org.org_id] = org;
      });

      const enriched: Group[] = groupRes.data.map((grp: Group) => ({
        ...grp,
        organization_name: orgMap[grp.org_id]?.name || "N/A",
      }));

      setData(enriched);
    } catch {
      setToast({
        message: "Failed to fetch groups or organizations",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deletegroup(id);
      setToast({ message: "Group deleted successfully", type: "success" });
      fetchData();
    } catch {
      setToast({ message: "Failed to delete group", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: { header: string; key: keyof Group }[] = [
    { header: "Group Name", key: "group_name" },
    { header: "Organization", key: "organization_name" },
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
        <h2 className="text-xl font-semibold">Groups</h2>
        <Link
          to="/group/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Group
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No groups found"
        renderActions={(group) => (
          <div className="flex gap-3">
            <Link
              to={`/group/edit/${group.group_id}`}
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() =>
                setConfirmDelete({ id: group.group_id, name: group.group_name })
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
          <h3 className="text-lg font-semibold mb-4">Delete Group</h3>
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
