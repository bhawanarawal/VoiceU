import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import { getPrograms, deleteProgram } from "./programService";
import { getOrganizations } from "../Organization/organizationService";

interface Program {
  program_id: number;
  program_name: string;
  total_semesters: number;
  is_active: boolean;
  org_id: number;
  organization_name?: string;
  affiliation_name?: string;
}

interface Organization {
  org_id: number;
  name: string;
  affiliation_name?: string;
}

export default function ProgramList() {
  const [data, setData] = useState<Program[]>([]);
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
      const [programRes, orgRes] = await Promise.all([
        getPrograms(),
        getOrganizations(),
      ]);

      const orgMap: Record<number, Organization> = {};
      orgRes.data.forEach((org: Organization) => {
        orgMap[org.org_id] = org;
      });

      const enriched: Program[] = programRes.data.map((program: Program) => ({
        ...program,
        organization_name: orgMap[program.org_id]?.name || "N/A",
        affiliation_name: orgMap[program.org_id]?.affiliation_name || "N/A",
      }));

      setData(enriched);
    } catch {
      setToast({
        message: "Failed to fetch programs or organizations",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteProgram(id);
      setToast({ message: "Program deleted successfully", type: "success" });
      fetchData();
    } catch {
      setToast({ message: "Failed to delete program", type: "error" });
    } finally {
      setConfirmDelete(null);
    }
  };

  const columns: { header: string; key: keyof Program }[] = [
    { header: "Program Name", key: "program_name" },
    { header: "Total Semesters", key: "total_semesters" },
    { header: "Organization", key: "organization_name" },
    { header: "Affiliation", key: "affiliation_name" },
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
        <h2 className="text-xl font-semibold">Programs</h2>
        <Link
          to="/program/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Program
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No programs found"
        renderActions={(program) => (
          <div className="flex gap-3">
            <Link
              to={`/program/edit/${program.program_id}`}
              className="text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={() =>
                setConfirmDelete({
                  id: program.program_id,
                  name: program.program_name,
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
          <h3 className="text-lg font-semibold mb-4">Delete Program</h3>
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
