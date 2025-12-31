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

interface Position {
  position_id: number;
  position_name: string;
}

function getElectionPhase(start: string, end: string) {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= endDate) return "ongoing";
  return "past";
}

function getBadgeColor(phase: string) {
  switch (phase) {
    case "upcoming":
      return "info";
    case "ongoing":
      return "success";
    case "past":
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
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [positionsOpen, setPositionsOpen] = useState(false);

  const [phase, setPhase] = useState("upcoming");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string | any[];
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/organizations/")
      .then((res) => setOrganizations(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    api
      .get("/positions/")
      .then((res) => setPositions(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (form.organization_id) {
      api
        .get(`/programs/?org_id=${form.organization_id}`)
        .then((res) => setPrograms(res.data))
        .catch(() => setPrograms([]));
    }
  }, [form.organization_id]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/elections/${id}`)
      .then((res) => {
        const data = res.data;
        setForm({
          election_name: data.election_name,
          description: data.description || "",
          organization_id: data.organization_id,
          program_id: data.program_id,
          affiliation_name: data.affiliation_name,
          start_date: data.start_date.slice(0, 16),
          end_date: data.end_date.slice(0, 16),
        });
        setSelectedPositions(
          data.positions?.map((p: any) => p.position_id) || []
        );
        setPhase(getElectionPhase(data.start_date, data.end_date));
      })
      .catch(console.error);
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
        affiliation_name: org?.affiliation_name || "",
        program_id: 0,
      }));
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
    if (!selectedPositions.length)
      newErrors.positions = "Please select at least one position";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      election_name: form.election_name,
      description: form.description,
      program_id: Number(form.program_id),
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      status: getElectionPhase(form.start_date, form.end_date),
      position_ids: selectedPositions.map(Number),
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
      let errorMessage: string | any[] = "Failed to save election";
      if (
        err.response?.status === 422 &&
        Array.isArray(err.response.data.detail)
      ) {
        errorMessage = err.response.data.detail.map(
          (e: any) => `${e.loc.join(" > ")}: ${e.msg}`
        );
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const isEditable = phase !== "past";

  return (
    <div>
      <PageMeta
        title={id ? "Edit Election | Dashboard" : "Add Election | Dashboard"}
        description="Election form"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Election" : "Add Election"} />
      {toast && (
        <Toast
          message={
            Array.isArray(toast.message)
              ? toast.message.join("\n")
              : toast.message
          }
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
              <label className="block text-sm text-gray-500 mb-1">
                Organization
              </label>
              <select
                id="organization_id"
                name="organization_id"
                aria-label="Organization"
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
              <label className="block text-sm text-gray-500 mb-1">
                Program
              </label>
              <select
                id="program_id"
                name="program_id"
                aria-label="Program"
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
              <label className="block text-sm text-gray-500 mb-1">
                Affiliation
              </label>
              <input
                id="affiliation_name"
                type="text"
                name="affiliation_name"
                placeholder="Affiliation"
                value={form.affiliation_name}
                disabled
                className="w-full border px-4 py-3 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Select Positions
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border px-4 py-3 rounded text-left flex justify-between items-center"
                  onClick={() => setPositionsOpen((prev) => !prev)}
                >
                  {selectedPositions.length
                    ? `Selected (${selectedPositions.length})`
                    : "Select positions"}
                  <span className="ml-2">{positionsOpen ? "▲" : "▼"}</span>
                </button>
                {positionsOpen && (
                  <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {positions.map((pos) => (
                      <label
                        key={pos.position_id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={pos.position_id}
                          checked={selectedPositions.includes(pos.position_id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedPositions((prev) =>
                              checked
                                ? [...prev, pos.position_id]
                                : prev.filter((id) => id !== pos.position_id)
                            );
                          }}
                          className="mr-2"
                        />
                        {pos.position_name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.positions && (
                <p className="text-red-500 text-sm mt-1">{errors.positions}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Description
              </label>
              <textarea
                placeholder="Enter description"
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Start Date
              </label>
              <input
                id="start_date"
                type="datetime-local"
                name="start_date"
                placeholder="Select start date"
                value={form.start_date}
                onChange={handleChange}
                disabled={!isEditable}
                className="w-full border px-4 py-3 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                End Date
              </label>
              <input
                id="end_date"
                type="datetime-local"
                name="end_date"
                placeholder="Select end date"
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
