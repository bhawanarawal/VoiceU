import { JSX, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { getElections, deleteElection } from "./electionService";

interface Position {
  position_id: number;
  position_name: string;
}

interface Election {
  election_id: number;
  election_name: string;
  program_name: string;
  description?: string;
  affiliation_name: string;
  organization_name: string;
  start_date: string;
  end_date: string;
  status: string;
  positions?: Position[];
  phase?: string;
}

function getElectionPhase(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (now < startDate) return "Upcoming";
  if (now >= startDate && now <= endDate) return "Ongoing";
  return "Past";
}

function getBadgeColor(phase: string) {
  switch (phase) {
    case "Upcoming":
      return "info";
    case "Ongoing":
      return "success";
    case "Past":
      return "dark";
    default:
      return "light";
  }
}

export default function ElectionList() {
  const [data, setData] = useState<Election[]>([]);
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
      const res = await getElections();
      setData(
        res.data.map((e: any) => ({
          ...e,
          phase: getElectionPhase(e.start_date, e.end_date),
          positions: e.positions || [],
        }))
      );
    } catch {
      setToast({ message: "Failed to fetch elections", type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: {
    header: string;
    key: keyof Election;
    renderCell?: (_columnKey: keyof Election, row: Election) => JSX.Element;
  }[] = [
    { header: "Election", key: "election_name" },
    { header: "Program", key: "program_name" },
    { header: "Affiliation", key: "affiliation_name" },
    { header: "Organization", key: "organization_name" },
    {
      header: "Positions",
      key: "positions",
      renderCell: (_key, row) => (
        <div className="flex flex-wrap gap-1">
          {row.positions?.map((pos, idx) => (
            <Badge key={idx} variant="solid" color="primary">
              {pos.position_name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      key: "phase",
      renderCell: (_key, row) => (
        <Badge variant="solid" color={getBadgeColor(row.phase || "Upcoming")}>
          {row.phase}
        </Badge>
      ),
    },
  ];

  const handleDelete = async (id: number) => {
    try {
      await deleteElection(id);
      setToast({ message: "Election deleted successfully", type: "success" });
      fetchData();
    } catch {
      setToast({ message: "Failed to delete election", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Elections</h2>
        <Link
          to="/election/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Election
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No elections found"
        renderActions={(row) => (
          <div className="flex gap-3">
            <Link
              to={`/election/edit/${row.election_id}`}
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() =>
                setConfirmDelete({
                  id: row.election_id,
                  name: row.election_name,
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
          <h3 className="text-lg font-semibold mb-4">Delete Election</h3>
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
