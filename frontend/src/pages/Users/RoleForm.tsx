import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { createRole } from "./roleService";

interface RoleFormData {
  name: string;
}

interface RoleFormErrors {
  name?: string;
}

export default function RoleForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RoleFormData>({
    name: "",
  });

  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors: RoleFormErrors = {};

    if (!form.name.trim()) newErrors.name = "Role name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createRole(form);
      setToast({ message: "Role created successfully", type: "success" });

      setTimeout(() => navigate("/dashboard/users/roles"), 1000);
    } catch {
      setToast({ message: "Failed to create role", type: "error" });
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
        title="Add Role | Dashboard"
        description="Add role on dashboard"
      />

      <PageBreadcrumb pageTitle="Add Role" />

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title="Add Role">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Role Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter role name"
                className={`w-full border px-4 py-3 rounded bg-transparent text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/roles")}
              >
                Back
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                Save Role
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
