import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { getPrograms, createProgram, updateProgram } from "./programService";
import { getOrganizations } from "../Organization/organizationService";

interface FormData {
  program_name: string;
  total_semesters: number;
  org_id?: number;
}

interface Organization {
  org_id: number;
  name: string;
  affiliation_name?: string;
}

export default function ProgramForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    program_name: "",
    total_semesters: 0,
    org_id: undefined,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [affiliationName, setAffiliationName] = useState<string>("N/A");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [errors, setErrors] = useState<{
    program_name?: string;
    total_semesters?: string;
    org_id?: string;
  }>({});

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrganizations();
        setOrganizations(res.data);
      } catch {
        setToast({ message: "Failed to fetch organizations", type: "error" });
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    if (id) {
      getPrograms()
        .then((res) => {
          const prog = res.data.find((p: any) => p.program_id === Number(id));
          if (prog) {
            setForm({
              program_name: prog.program_name,
              total_semesters: prog.total_semesters,
              org_id: prog.org_id,
            });
            setAffiliationName(prog.affiliation_name || "N/A");
          }
        })
        .catch(() =>
          setToast({ message: "Failed to fetch program", type: "error" })
        );
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "org_id" ? Number(value) : value,
    }));

    if (name === "org_id") {
      const selectedOrg = organizations.find(
        (org) => org.org_id === Number(value)
      );
      setAffiliationName(selectedOrg?.affiliation_name || "N/A");
    }

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!form.program_name.trim())
      newErrors.program_name = "Program Name is required";
    if (!form.total_semesters || form.total_semesters <= 0)
      newErrors.total_semesters = "Total Semesters must be greater than 0";
    if (!form.org_id) newErrors.org_id = "Please select an organization";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (id) {
        await updateProgram(Number(id), form);
        setToast({ message: "Program updated successfully", type: "success" });
      } else {
        await createProgram(form);
        setToast({ message: "Program created successfully", type: "success" });
      }
      setTimeout(() => navigate("/program"), 1000);
    } catch {
      setToast({ message: "Failed to save program", type: "error" });
    }
  };

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <PageMeta
        title={id ? "Edit Program | Dashboard" : "Add Program | Dashboard"}
        description="Add or edit Program on dashboard"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Program" : "Add Program"} />

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title={id ? "Edit Program" : "Add Program"}>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Program Name
              </label>
              <input
                type="text"
                name="program_name"
                value={form.program_name}
                onChange={handleChange}
                placeholder="Enter program name"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.program_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.program_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Total Semesters
              </label>
              <input
                type="number"
                name="total_semesters"
                value={form.total_semesters}
                onChange={handleChange}
                placeholder="Enter total semesters"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.total_semesters && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.total_semesters}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Organization
              </label>
              <select
                name="org_id"
                value={form.org_id || ""}
                onChange={handleChange}
                aria-label="Organization"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.org_id} value={org.org_id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.org_id && (
                <p className="text-red-500 text-sm mt-1">{errors.org_id}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="affiliation_name"
                className="block text-gray-500 dark:text-gray-400 text-sm mb-1"
              >
                Affiliation
              </label>
              <input
                id="affiliation_name"
                type="text"
                value={affiliationName}
                readOnly
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              />
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => navigate("/program")}>
                Back
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {id ? "Update Program" : "Save Program"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
