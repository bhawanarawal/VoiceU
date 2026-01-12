import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import {
  getPositionById,
  createPosition,
  updatePosition,
} from "./positionService";

interface PositionFormData {
  position_name: string;
  description: string;
  max_candidates: number;
}

interface PositionFormErrors {
  position_name?: string;
  description?: string;
  max_candidates?: string;
}

export default function PositionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<PositionFormData>({
    position_name: "",
    description: "",
    max_candidates: 1,
  });

  const [errors, setErrors] = useState<PositionFormErrors>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (id) {
      getPositionById(Number(id))
        .then((res) => {
          setForm({
            position_name: res.data.position_name,
            description: res.data.description || "",
            max_candidates: res.data.max_candidates,
          });
        })
        .catch(() =>
          setToast({ message: "Failed to fetch position", type: "error" })
        );
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "max_candidates" ? Number(value) : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors: PositionFormErrors = {};

    if (!form.position_name.trim())
      newErrors.position_name = "Position name is required";
    if (!form.max_candidates || form.max_candidates <= 0)
      newErrors.max_candidates = "Enter a valid positive number";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (id) {
        await updatePosition(Number(id), form);
        setToast({ message: "Position updated successfully", type: "success" });
      } else {
        await createPosition(form);
        setToast({ message: "Position created successfully", type: "success" });
      }

      setTimeout(() => navigate("/position"), 1000);
    } catch {
      setToast({ message: "Failed to save position", type: "error" });
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
        title={id ? "Edit Position | Dashboard" : "Add Position | Dashboard"}
        description="Add or edit position on dashboard"
      />

      <PageBreadcrumb pageTitle={id ? "Edit Position" : "Add Position"} />

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title={id ? "Edit Position" : "Add Position"}>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Position Name
              </label>
              <input
                type="text"
                name="position_name"
                value={form.position_name}
                onChange={handleChange}
                placeholder="Enter position name"
                className={`w-full border px-4 py-3 rounded bg-transparent text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.position_name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.position_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.position_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-500 text-sm mb-1">
                Maximum Candidates
              </label>
              <input
                type="number"
                name="max_candidates"
                value={form.max_candidates}
                onChange={handleChange}
                min={1}
                placeholder="Enter maximum candidates"
                className={`w-full border px-4 py-3 rounded bg-transparent text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.max_candidates ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.max_candidates && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.max_candidates}
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
                className={`w-full border px-4 py-3 rounded bg-transparent text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 h-32 resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => navigate("/position")}>
                Back
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {id ? "Update Position" : "Save Position"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
