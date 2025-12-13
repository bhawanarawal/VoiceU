import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getOrganizations, deleteOrganization } from "./organizationService";

interface Organization {
  org_id: number;
  name: string;
  address?: string;
  description?: string;
}

export default function OrganizationList() {
  const [data, setData] = useState<Organization[]>([]);

  const fetchData = async () => {
    const res = await getOrganizations();
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;

    try {
      const res = await deleteOrganization(id);
      console.log("DELETE RESPONSE:", res.data);
      fetchData();
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-white/[0.05]">
        <h2 className="text-xl font-semibold">Organizations</h2>
        <Link
          to="/organization/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Add Organization
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start"
              >
                Name
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start"
              >
                Address
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start"
              >
                Description
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-gray-500 text-start"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((org) => (
              <TableRow key={org.org_id}>
                <TableCell className="px-5 py-4 text-gray-800">
                  {org.name}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-500">
                  {org.address || "-"}
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-500">
                  {org.description || "-"}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <div className="flex gap-3">
                    <Link
                      to={`/organization/edit/${org.org_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(org.org_id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
