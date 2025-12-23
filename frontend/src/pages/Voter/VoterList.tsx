import { JSX, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import { getVoters, deleteVoter } from "./voterService";

interface Voter {
  voter_id: number;
  user_id: number;
  username: string;
  full_name: string;
  org_id: number;
  org_name: string;
  affiliation_id: number;
  affiliation_name: string;
  affiliation_level?: string;
}

export default function VoterList() {
  const [data, setData] = useState<Voter[]>([]);
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
      const res = await getVoters();
      setData(res.data);
    } catch {
      setToast({ message: "Failed to fetch voters", type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteVoter(id);
      setToast({ message: "Voter deleted successfully", type: "success" });
      setData((prev) => prev.filter((v) => v.voter_id !== id));
    } catch {
      setToast({ message: "Failed to delete voter", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: {
    header: string;
    key: keyof Voter;
    renderCell?: (key: keyof Voter, row: Voter) => JSX.Element | string;
  }[] = [
    { header: "Voter ID", key: "voter_id" },
    { header: "Username", key: "username" },
    { header: "Full Name", key: "full_name" },
    { header: "Organization", key: "org_name" },
    { header: "Affiliation", key: "affiliation_name" },
    { header: "Level", key: "affiliation_level" },
  ];

  return (
    <div className="p-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Voters</h2>
        <Link
          to="/voter/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Voter
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No voters found"
        renderActions={(row: Voter) => (
          <div className="flex gap-2 flex-wrap">
            <Link
              to={`/voter/edit/${row.voter_id}`}
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() =>
                setConfirmDelete({
                  id: row.voter_id,
                  name: row.full_name,
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
          <h3 className="text-lg font-semibold mb-4">Delete Voter</h3>
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
