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
  organization_id: number;
  program_id: number;
  affiliation_name: string;
  start_date: string;
  end_date: string;
}

interface Organization {
  org_id: number;
  name: string;
  affiliation_name: string;
}

interface Program {
  program_id: number;
  program_name: string;
}

function getElectionPhase(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (now < startDate) return "Upcoming";
  if (now >= startDate && now <= endDate) return "Ongoing";
  return "Past";
}

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
    organization_id: 0,
    program_id: 0,
    affiliation_name: "",
    start_date: "",
    end_date: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [phase, setPhase] = useState("Upcoming");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await api.get("/organizations/");
        setOrganizations(res.data);
      } catch (err) {
        console.error("Failed to load organizations", err);
      }
    };
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchElection = async () => {
      try {
        const res = await api.get(`/elections/${id}`);
        const start = res.data.start_date.slice(0, 16);
        const end = res.data.end_date.slice(0, 16);

        setForm({
          election_name: res.data.election_name,
          description: res.data.description || "",
          organization_id: res.data.organization_id,
          program_id: res.data.program_id,
          affiliation_name: res.data.affiliation_name,
          start_date: start,
          end_date: end,
        });

        if (res.data.organization_id) {
          const resPrograms = await api.get(
            `/programs/?org_id=${res.data.organization_id}`
          );
          setPrograms(resPrograms.data);
        }

        setPhase(getElectionPhase(res.data.start_date, res.data.end_date));
      } catch (err) {
        console.error("Failed to load election", err);
      }
    };
    fetchElection();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "organization_id") {
      const org = organizations.find((o) => o.org_id === Number(value));
      setForm((prev) => ({
        ...prev,
        affiliation_name: org ? org.affiliation_name : "",
        program_id: 0,
      }));

      const fetchPrograms = async () => {
        try {
          const res = await api.get(`/programs/?org_id=${value}`);
          setPrograms(res.data);
        } catch {
          setPrograms([]);
        }
      };
      fetchPrograms();
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.election_name.trim())
      newErrors.election_name = "Election name is required";
    if (!form.organization_id)
      newErrors.organization_id = "Please select an organization";
    if (!form.program_id) newErrors.program_id = "Please select a program";
    if (!form.start_date) newErrors.start_date = "Start date is required";
    if (!form.end_date) newErrors.end_date = "End date is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      election_name: form.election_name,
      description: form.description,
      program_id: Number(form.program_id),
      affiliation_name: form.affiliation_name,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      status: getElectionPhase(form.start_date, form.end_date).toLowerCase(),
    };

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
      const errorMessage =
        err.response?.data?.detail || "Failed to save election";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const isEditable = phase !== "Past";

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
              <label
                htmlFor="election_name"
                className="block text-sm text-gray-500 mb-1"
              >
                Election Name
              </label>
              <input
                id="election_name"
                type="text"
                name="election_name"
                placeholder="Enter election name"
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
              <label
                htmlFor="organization"
                className="block text-sm text-gray-500 mb-1"
              >
                Organization
              </label>
              <select
                id="organization"
                name="organization_id"
                value={form.organization_id}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select organization</option>
                {organizations.map((o) => (
                  <option key={o.org_id} value={o.org_id}>
                    {o.name}
                  </option>
                ))}
              </select>
              {errors.organization_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.organization_id}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="program"
                className="block text-sm text-gray-500 mb-1"
              >
                Program
              </label>
              <select
                id="program"
                name="program_id"
                value={form.program_id}
                onChange={handleChange}
                disabled={!isEditable || !form.organization_id}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select program</option>
                {programs.map((p) => (
                  <option key={p.program_id} value={p.program_id}>
                    {p.program_name}
                  </option>
                ))}
              </select>
              {errors.program_id && (
                <p className="text-red-500 text-sm mt-1">{errors.program_id}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="affiliation"
                className="block text-sm text-gray-500 mb-1"
              >
                Affiliation
              </label>
              <input
                id="affiliation"
                type="text"
                name="affiliation_name"
                value={form.affiliation_name}
                disabled
                className="w-full border px-4 py-3 rounded bg-gray-100"
                aria-readonly="true"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm text-gray-500 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter election description"
                value={form.description}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              />
            </div>

            <div>
              <label
                htmlFor="start_date"
                className="block text-sm text-gray-500 mb-1"
              >
                Start Date
              </label>
              <input
                id="start_date"
                type="datetime-local"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              />
            </div>

            <div>
              <label
                htmlFor="end_date"
                className="block text-sm text-gray-500 mb-1"
              >
                End Date
              </label>
              <input
                id="end_date"
                type="datetime-local"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              />
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
