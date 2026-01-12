import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { getgroups, creategroup, updategroup } from "./groupService";
import { getOrganizations } from "../Organization/organizationService";

interface FormData {
  group_name: string;
  org_id?: number;
  description?: string;
}

interface Organization {
  org_id: number;
  name: string;
}

export default function GroupForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    group_name: "",
    org_id: undefined,
    description: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [errors, setErrors] = useState<{
    group_name?: string;
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
      getgroups()
        .then((res) => {
          const grp = res.data.find((g: any) => g.group_id === Number(id));
          if (grp) {
            setForm({
              group_name: grp.group_name,
              org_id: grp.org_id,
              description: grp.description || "",
            });
          }
        })
        .catch(() =>
          setToast({ message: "Failed to fetch group", type: "error" })
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
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!form.group_name.trim())
      newErrors.group_name = "Group Name is required";
    if (!form.org_id) newErrors.org_id = "Please select an organization";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (id) {
        await updategroup(Number(id), form);
        setToast({ message: "Group updated successfully", type: "success" });
      } else {
        await creategroup(form);
        setToast({ message: "Group created successfully", type: "success" });
      }
      setTimeout(() => navigate("/group"), 1000);
    } catch {
      setToast({ message: "Failed to save group", type: "error" });
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
        title={id ? "Edit Group | Dashboard" : "Add Group | Dashboard"}
        description="Add or edit group on dashboard"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Group" : "Add Group"} />

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title={id ? "Edit Group" : "Add Group"}>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Group Name
              </label>
              <input
                type="text"
                name="group_name"
                value={form.group_name}
                onChange={handleChange}
                placeholder="Enter group name"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.group_name && (
                <p className="text-red-500 text-sm mt-1">{errors.group_name}</p>
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
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Enter description"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => navigate("/group")}>
                Back
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {id ? "Update Group" : "Save Group"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
