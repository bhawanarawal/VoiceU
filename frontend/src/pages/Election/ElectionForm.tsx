// src/pages/Election/ElectionForm.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import Badge from "../../components/ui/badge/Badge";
import api from "../../utils/api";

interface ElectionFormState {
  election_name: string;
  description?: string;
  affiliation_id: number;
  start_date: string;
  end_date: string;
}

interface Affiliation {
  affiliation_id: number;
  affiliation_name: string;
}

// Determine election phase / status
function getElectionPhase(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (now < startDate) return "Upcoming";
  if (now >= startDate && now <= endDate) return "Ongoing";
  return "Past";
}

// Badge color mapping
function getBadgeColor(phase: string) {
  switch (phase) {
    case "Upcoming":
      return "info";
    case "Ongoing":
      return "success";
    case "Past":
      return "dark";
    default:
      return "light";
  }
}

export default function ElectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<ElectionFormState>({
    election_name: "",
    description: "",
    affiliation_id: 0,
    start_date: "",
    end_date: "",
  });

  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [phase, setPhase] = useState("Upcoming");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch affiliations and election for edit mode
  useEffect(() => {
    const fetchAffiliations = async () => {
      try {
        const res = await api.get("/affiliations/");
        setAffiliations(res.data);
      } catch (err) {
        console.error("Failed to load affiliations", err);
      }
    };
    fetchAffiliations();

    if (id) {
      const fetchElection = async () => {
        try {
          const res = await api.get(`/elections/${id}`);
          const start = res.data.start_date.slice(0, 16);
          const end = res.data.end_date.slice(0, 16);
          const currentPhase = getElectionPhase(
            res.data.start_date,
            res.data.end_date
          );

          setForm({
            election_name: res.data.election_name,
            description: res.data.description || "",
            affiliation_id: res.data.affiliation_id,
            start_date: start,
            end_date: end,
          });

          setPhase(currentPhase);
        } catch (err) {
          console.error("Failed to load election", err);
        }
      };
      fetchElection();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    // Client-side validation
    if (!form.election_name.trim())
      newErrors.election_name = "Election name is required";
    if (!form.affiliation_id || form.affiliation_id === 0)
      newErrors.affiliation_id = "Please select an affiliation";
    if (!form.start_date) newErrors.start_date = "Start date is required";
    if (!form.end_date) newErrors.end_date = "End date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare payload
    const payload = {
      ...form,
      affiliation_id: Number(form.affiliation_id),
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      status: getElectionPhase(form.start_date, form.end_date), // auto-set status
    };

    console.log("Submitting payload:", payload);

    setLoading(true);
    try {
      if (id) {
        await api.put(`/elections/${id}`, payload);
        setToast({ message: "Election updated successfully", type: "success" });
      } else {
        await api.post("/elections/", payload);
        setToast({ message: "Election created successfully", type: "success" });
      }
      setTimeout(() => navigate("/election"), 500);
    } catch (err: any) {
      console.error("Failed to save election:", err.response?.data || err);

      let errorMessage = "Failed to save election";

      if (
        err.response?.status === 422 &&
        Array.isArray(err.response.data?.detail)
      ) {
        errorMessage = err.response.data.detail
          .map((d: any) => {
            const field = d.loc[d.loc.length - 1];
            return `${field}: ${d.msg}`;
          })
          .join(", ");
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }

      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const isEditable = phase !== "Past";
  const isPartialEditable = phase === "Ongoing";

  return (
    <div>
      <PageMeta
        title={id ? "Edit Election | Dashboard" : "Add Election | Dashboard"}
        description="Election form"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Election" : "Add Election"} />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {id && (
        <div className="mb-4">
          <Badge variant="solid" color={getBadgeColor(phase)}>
            {phase}
          </Badge>
        </div>
      )}

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title="Election Information">
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Election Name
              </label>
              <input
                type="text"
                name="election_name"
                value={form.election_name}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              />
              {errors.election_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.election_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Affiliation
              </label>
              <select
                name="affiliation_id"
                value={form.affiliation_id}
                onChange={handleChange}
                disabled={!isEditable || isPartialEditable}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select affiliation</option>
                {affiliations.map((a) => (
                  <option key={a.affiliation_id} value={a.affiliation_id}>
                    {a.affiliation_name}
                  </option>
                ))}
              </select>
              {errors.affiliation_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.affiliation_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                disabled={!isEditable || isPartialEditable}
                className="w-full border px-4 py-3 rounded"
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                disabled={!isEditable || isPartialEditable}
                className="w-full border px-4 py-3 rounded"
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/election")}>
                Back
              </Button>
              {isEditable && (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : id
                    ? "Update Election"
                    : "Save Election"}
                </Button>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
