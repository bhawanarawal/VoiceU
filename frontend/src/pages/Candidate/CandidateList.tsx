import { JSX, useEffect, useState } from "react";
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
  election_name: string;
  position_name: string;
  group_name: string;
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
    status: "approved" | "rejected",
  ) => {
    try {
      await updateCandidateApproval(id, status);
      setToast({ message: `Candidate ${status}`, type: "success" });

      setData((prev) =>
        prev.map((c) =>
          c.candidate_id === id ? { ...c, approval_status: status } : c,
        ),
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
    { header: "Group", key: "group_name" },
    { header: "Election", key: "election_name" },
    { header: "Position", key: "position_name" },
    {
      header: "Approval Status",
      key: "approval_status",
      renderCell: (_key, row) => {
        const color =
          row.approval_status === "approved"
            ? "text-green-600"
            : row.approval_status === "rejected"
              ? "text-red-600"
              : "text-yellow-600";

        return (
          <span className={`font-semibold ${color}`}>
            {row.approval_status.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: "Manifesto",
      key: "manifesto",
      renderCell: (_key, row) =>
        row.manifesto ? (
          <span title={row.manifesto}>
            {row.manifesto.length > 40
              ? row.manifesto.slice(0, 40) + "..."
              : row.manifesto}
          </span>
        ) : (
          "N/A"
        ),
    },
    {
      header: "Photo",
      key: "photo_url",
      renderCell: (_key, row) =>
        row.photo_url ? (
          <img
            src={
              row.photo_url.startsWith("http")
                ? row.photo_url
                : `${import.meta.env.VITE_API_BASE_URL}${row.photo_url}`
            }
            alt={row.username}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <div className="p-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Candidate Applications</h2>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No candidates found"
        renderActions={(row: Candidate) => (
          <div className="flex flex-col gap-2">
            {/* Always show Delete */}
            <button
              onClick={() =>
                setConfirmDelete({
                  id: row.candidate_id,
                  name: row.username,
                })
              }
              className="text-red-600 hover:underline"
            >
              Delete
            </button>

            {row.approval_status === "pending" ? (
              <>
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
              </>
            ) : (
              <span
                className={`text-sm font-semibold ${
                  row.approval_status === "approved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {row.approval_status.toUpperCase()}
              </span>
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
            Are you sure you want to delete{" "}
            <strong>{confirmDelete.name}</strong>?
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
