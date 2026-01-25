import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import api from "../../utils/api";

interface Voter {
  voter_id: number;
  username: string;
  full_name: string;
  email: string;
  org_name: string;
  group_status: string;
}

export default function ApprovedVoters() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await api.get("/voters");
        const allVoters: Voter[] = Array.isArray(res.data)
          ? res.data
          : res.data.voters || [];
        const approved = allVoters.filter((v) => v.group_status === "APPROVED");
        setVoters(approved);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch voters");
      } finally {
        setLoading(false);
      }
    };

    fetchVoters();
  }, []);

  if (loading)
    return <p className="text-gray-500">Loading approved voters...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        VoiceU Voters
      </h3>

      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="text-left text-gray-600 dark:text-gray-300 py-5 text-lg font-semibold"
              >
                Full Name
              </TableCell>
              <TableCell
                isHeader
                className="text-left text-gray-600 dark:text-gray-300 py-5 text-lg font-semibold"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="text-left text-gray-600 dark:text-gray-300 py-5 text-lg font-semibold"
              >
                Organization
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {voters.map((voter) => (
              <TableRow
                key={voter.voter_id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <TableCell className="py-3 font-medium text-gray-800 dark:text-white">
                  {voter.full_name || voter.username}
                </TableCell>
                <TableCell className="py-3 text-gray-600 dark:text-gray-300">
                  {voter.username}
                </TableCell>
                <TableCell className="py-3 text-gray-600 dark:text-gray-300">
                  {voter.org_name || "-"}
                </TableCell>
              </TableRow>
            ))}
            {voters.length === 0 && (
              <TableRow>
                <td
                  colSpan={3}
                  className="py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No approved voters found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
