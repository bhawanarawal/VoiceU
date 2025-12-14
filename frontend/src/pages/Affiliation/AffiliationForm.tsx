import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import {
  getAffiliationById,
  createAffiliation,
  updateAffiliation,
} from "./affiliationService";
import { getOrganizations } from "../Organization/organizationService";

interface AffiliationForm {
  affiliation_name: string;
  description?: string;
  org_id: number;
}

interface Organization {
  org_id: number;
  name: string;
}

export default function AffiliationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<AffiliationForm>({
    affiliation_name: "",
    description: "",
    org_id: 0,
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // State for validation errors
  const [errors, setErrors] = useState<{
    affiliation_name?: string;
    org_id?: string;
  }>({});

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrganizations();
        setOrganizations(res.data);
      } catch {}
    };
    fetchOrgs();

    if (id) {
      const fetchAff = async () => {
        try {
          const res = await getAffiliationById(Number(id));
          setForm(res.data);
        } catch {}
      };
      fetchAff();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined }); // Clear error on change
  };

  const handleSubmit = async () => {
    // Front-end validation
    const newErrors: typeof errors = {};
    if (!form.affiliation_name.trim())
      newErrors.affiliation_name = "Affiliation Name is required";
    if (form.org_id === 0) newErrors.org_id = "Please select an organization";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (id) {
        await updateAffiliation(Number(id), form);
        setToast({
          message: "Affiliation updated successfully",
          type: "success",
        });
      } else {
        await createAffiliation(form);
        setToast({
          message: "Affiliation created successfully",
          type: "success",
        });
      }
      setTimeout(() => navigate("/affiliation"), 500);
    } catch {
      setToast({ message: "Failed to save affiliation", type: "error" });
    }
  };

  return (
    <div>
      <PageMeta
        title={
          id ? "Edit Affiliation | Dashboard" : "Add Affiliation | Dashboard"
        }
        description="Affiliation form"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Affiliation" : "Add Affiliation"} />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title="Affiliation Information">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Affiliation Name
              </label>
              <input
                type="text"
                name="affiliation_name"
                value={form.affiliation_name}
                onChange={handleChange}
                placeholder="Enter affiliation name"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.affiliation_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.affiliation_name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Organization
              </label>
              <select
                name="org_id"
                value={form.org_id}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={0}>
                  {organizations.length === 0
                    ? "No organizations available"
                    : "Select organization"}
                </option>
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
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/affiliation")}
              >
                Back
              </Button>
              <Button variant="primary" size="md" onClick={handleSubmit}>
                {id ? "Update Affiliation" : "Save Affiliation"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
