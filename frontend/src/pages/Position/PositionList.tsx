import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import { getPositions, deletePosition } from "./positionService";

interface Position {
  position_id: number;
  position_name: string;
  description?: string;
  max_candidates?: number;
}

export default function PositionList() {
  const [data, setData] = useState<Position[]>([]);
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
      const res = await getPositions();
      setData(res.data);
    } catch {
      setToast({ message: "Failed to fetch positions", type: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deletePosition(id);
      setToast({ message: "Position deleted successfully", type: "success" });
      fetchData();
    } catch {
      setToast({ message: "Failed to delete position", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: { header: string; key: keyof Position }[] = [
    { header: "Position Name", key: "position_name" },
    { header: "Maximum Candidates", key: "max_candidates" },
    { header: "Description", key: "description" },
  ];

  return (
    <div className="p-5">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Positions</h2>
        <Link
          to="/position/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Position
        </Link>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No positions found"
        renderActions={(pos) => (
          <div className="flex gap-3">
            <Link
              to={`/position/edit/${pos.position_id}`}
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() =>
                setConfirmDelete({
                  id: pos.position_id,
                  name: pos.position_name,
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
          <h3 className="text-lg font-semibold mb-4">Delete Position</h3>
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
