import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import {
  getOrganizationById,
  createOrganization,
  updateOrganization,
} from "./organizationService";

interface FormData {
  name: string;
  address?: string;
  description?: string;
}

export default function OrganizationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    name: "",
    address: "",
    description: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});

  useEffect(() => {
    if (id) {
      getOrganizationById(Number(id))
        .then((res) => setForm(res.data))
        .catch(() =>
          setToast({ message: "Failed to fetch organization", type: "error" })
        );
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Organization Name is required";
    if (form.address && form.address.length > 100)
      newErrors.address = "Address cannot exceed 200 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (id) {
        await updateOrganization(Number(id), form);
        setToast({
          message: "Organization updated successfully",
          type: "success",
        });
      } else {
        await createOrganization(form);
        setToast({
          message: "Organization created successfully",
          type: "success",
        });
      }

      setTimeout(() => navigate("/organization"), 1000);
    } catch (err) {
      setToast({ message: "Failed to save organization", type: "error" });
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
        title={
          id ? "Edit Organization | Dashboard" : "Add Organization | Dashboard"
        }
        description="Add or edit Organization on dashboard"
      />

      <PageBreadcrumb
        pageTitle={id ? "Edit Organization" : "Add Organization"}
      />
      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title={id ? "Edit Organization" : "Add Organization"}>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter organization address"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter organization description"
                className="w-full border border-gray-300 dark:border-gray-700 px-4 py-3 rounded bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 h-48 resize-none"
              />
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/organization")}
              >
                Back
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {id ? "Update Organization" : "Save Organization"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
