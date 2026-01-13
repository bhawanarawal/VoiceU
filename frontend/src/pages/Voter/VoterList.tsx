import { useEffect, useState } from "react";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Toast from "../../components/common/Toast";
import { DataTable } from "../../components/ui/table";
import {
  getVoters,
  deleteVoter,
  approveVoterGroup,
  rejectVoterGroup,
} from "./voterService";

interface Group {
  voter_group_id: number;
  group_id: number;
  group_name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface Voter {
  voter_id: number;
  user_id: number;
  full_name: string;
  username: string;
  org_name: string;
  registered_at: string;
  groups: Group[];
}

export default function VoterList() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    voter_id: number;
    name: string;
  } | null>(null);

  const fetchVoters = async () => {
    try {
      const res = await getVoters();
      setVoters(res.data);
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Failed to fetch voters",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  const handleApprove = async (voter_group_id: number) => {
    try {
      await approveVoterGroup(voter_group_id);
      setToast({ message: "Group approved", type: "success" });

      setVoters((prev) =>
        prev.map((v) => ({
          ...v,
          groups: v.groups.map((g) =>
            g.voter_group_id === voter_group_id
              ? { ...g, status: "APPROVED" }
              : g
          ),
        }))
      );
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Failed to approve",
        type: "error",
      });
    }
  };

  const handleReject = async (voter_group_id: number) => {
    try {
      await rejectVoterGroup(voter_group_id);
      setToast({ message: "Group rejected", type: "success" });

      setVoters((prev) =>
        prev.map((v) => ({
          ...v,
          groups: v.groups.map((g) =>
            g.voter_group_id === voter_group_id
              ? { ...g, status: "REJECTED" }
              : g
          ),
        }))
      );
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Failed to reject",
        type: "error",
      });
    }
  };

  const handleDelete = async (voter_id: number) => {
    try {
      await deleteVoter(voter_id);
      setToast({ message: "Voter deleted successfully", type: "success" });
      setVoters((prev) => prev.filter((v) => v.voter_id !== voter_id));
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Failed to delete voter",
        type: "error",
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const pendingVoters = voters.filter((v) =>
    v.groups.some((g) => g.status === "PENDING")
  );

  const tableData = voters
    .map((v) => {
      const nonPending = v.groups.filter((g) => g.status !== "PENDING");
      if (nonPending.length === 0) return null;

      return {
        voter_id: v.voter_id,
        full_name: v.full_name,
        username: v.username,
        org_name: v.org_name,
        registered_at: v.registered_at,
        group_name: nonPending.map((g) => g.group_name).join(", "),
        group_status: nonPending.map((g) => g.status).join(", "),
      };
    })
    .filter(Boolean) as any[];

  const columns = [
    { header: "Full Name", key: "full_name" },
    { header: "Username", key: "username" },
    { header: "Organization", key: "org_name" },
    { header: "Group", key: "group_name" },
    { header: "Status", key: "group_status" },
    { header: "Registered At", key: "registered_at" },
  ];

  return (
    <div className="p-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <h2 className="text-xl font-semibold mb-4">Pending Voters</h2>

      {pendingVoters.length === 0 ? (
        <p>No pending voters</p>
      ) : (
        <div className="space-y-4 mb-6">
          {pendingVoters.map((voter) => (
            <div key={voter.voter_id} className="border p-4 rounded shadow">
              <p>
                <strong>Name:</strong> {voter.full_name}
              </p>
              <p>
                <strong>Username:</strong> {voter.username}
              </p>
              <p>
                <strong>Organization:</strong> {voter.org_name}
              </p>
              <p>
                <strong>Registered At:</strong>{" "}
                {new Date(voter.registered_at).toLocaleString()}
              </p>

              <table className="w-full mt-3 border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Group</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {voter.groups
                    .filter((g) => g.status === "PENDING")
                    .map((g) => (
                      <tr key={g.voter_group_id}>
                        <td className="p-2 border">{g.group_name}</td>
                        <td className="p-2 border">{g.status}</td>
                        <td className="p-2 border flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(g.voter_group_id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(g.voter_group_id)}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Voters List</h2>

      <DataTable
        columns={columns}
        data={tableData}
        emptyMessage="Voters not found"
        renderActions={(row: any) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setConfirmDelete({
                voter_id: row.voter_id,
                name: row.full_name,
              })
            }
          >
            Delete
          </Button>
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
              onClick={() => handleDelete(confirmDelete.voter_id)}
            >
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
