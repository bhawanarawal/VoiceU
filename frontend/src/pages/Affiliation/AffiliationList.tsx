import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import { getAffiliations, deleteAffiliation } from "./affiliationService";
import { getOrganizations } from "../Organization/organizationService";

interface Affiliation {
  affiliation_id: number;
  affiliation_name: string;
  description?: string;
  org_id: number;
  org_name?: string;
}

export default function AffiliationList() {
  const [data, setData] = useState<Affiliation[]>([]);
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
      const [affRes, orgRes] = await Promise.all([
        getAffiliations(),
        getOrganizations(),
      ]);
      const orgMap = orgRes.data.reduce(
        (acc: Record<number, string>, org: any) => {
          acc[org.org_id] = org.name;
          return acc;
        },
        {}
      );
      const enriched = affRes.data.map((aff: any) => ({
        ...aff,
        org_name: orgMap[aff.org_id] || "Unknown",
      }));
      setData(enriched);
    } catch {
      setToast({ message: "Failed to fetch affiliations", type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteAffiliation(id);
      setToast({
        message: "Affiliation deleted successfully",
        type: "success",
      });
      fetchData();
    } catch {
      setToast({ message: "Failed to delete affiliation", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: { header: string; key: keyof Affiliation }[] = [
    { header: "Affiliation", key: "affiliation_name" },
    { header: "Description", key: "description" },
    { header: "Organization", key: "org_name" },
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
        <h2 className="text-xl font-semibold">Affiliations</h2>
        <Link
          to="/affiliation/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Affiliation
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No affiliations found"
        renderActions={(aff) => (
          <div className="flex gap-3">
            <Link
              to={`/affiliation/edit/${aff.affiliation_id}`}
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() =>
                setConfirmDelete({
                  id: aff.affiliation_id,
                  name: aff.affiliation_name,
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
          <h3 className="text-lg font-semibold mb-4">Delete Affiliation</h3>
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
