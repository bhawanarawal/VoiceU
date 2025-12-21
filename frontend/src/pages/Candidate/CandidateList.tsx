import { JSX, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import {
  getCandidates,
  deleteCandidate,
  updateCandidateApproval,
} from "./candidateService";

interface Candidate {
  candidate_id: number;
  username: string;
  organization_name: string;
  affiliation_name: string;
  election_name: string;
  position_name: string;
  approval_status: "pending" | "approved" | "rejected";
  manifesto?: string;
  photo_url?: string;
}

export default function CandidateList() {
  const [data, setData] = useState<Candidate[]>([]);
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
      const res = await getCandidates();
      setData(res.data);
    } catch {
      setToast({ message: "Failed to fetch candidates", type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteCandidate(id);
      setToast({ message: "Candidate deleted successfully", type: "success" });
      setData((prev) => prev.filter((c) => c.candidate_id !== id));
    } catch {
      setToast({ message: "Failed to delete candidate", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleApproval = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateCandidateApproval(id, status);
      setToast({ message: `Candidate ${status}`, type: "success" });

      setData((prev) =>
        prev.map((c) =>
          c.candidate_id === id ? { ...c, approval_status: status } : c
        )
      );
    } catch {
      setToast({ message: "Failed to update approval", type: "error" });
    }
  };

  const columns: {
    header: string;
    key: keyof Candidate;
    renderCell?: (key: keyof Candidate, row: Candidate) => JSX.Element | string;
  }[] = [
    { header: "Username", key: "username" },
    { header: "Organization", key: "organization_name" },
    { header: "Affiliation", key: "affiliation_name" },
    { header: "Election", key: "election_name" },
    { header: "Position", key: "position_name" },
    {
      header: "Approval Status",
      key: "approval_status",
      renderCell: (_key, row) => {
        const colorClass =
          row.approval_status === "approved"
            ? "text-green-600 font-semibold"
            : row.approval_status === "rejected"
            ? "text-red-600 font-semibold"
            : "text-yellow-600 font-semibold";

        return (
          <span className={colorClass}>
            {row.approval_status.toUpperCase()}
          </span>
        );
      },
    },
    { header: "Manifesto", key: "manifesto" },
    {
      header: "Photo",
      key: "photo_url",
      renderCell: (_key, row) =>
        row.photo_url ? (
          <img
            src={row.photo_url}
            alt={`Candidate ${row.username}`}
            className="h-10 w-10 object-cover rounded"
          />
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <div className="p-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Candidates</h2>
        <Link
          to="/candidate/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Candidate
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No candidates found"
        renderActions={(row: Candidate) => (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 flex-wrap">
              <Link
                to={`/candidate/edit/${row.candidate_id}`}
                className="text-blue-600 hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() =>
                  setConfirmDelete({ id: row.candidate_id, name: row.username })
                }
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>

            {row.approval_status === "pending" && (
              <div className="flex gap-2 flex-col mt-1">
                <button
                  onClick={() => handleApproval(row.candidate_id, "approved")}
                  className="text-green-600 hover:underline"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval(row.candidate_id, "rejected")}
                  className="text-red-600 hover:underline"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      />

      {confirmDelete && (
        <Modal
          isOpen
          onClose={() => setConfirmDelete(null)}
          className="max-w-md p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Delete Candidate</h3>
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
