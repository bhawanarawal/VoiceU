import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import Badge from "../../components/ui/badge/Badge";
import api from "../../utils/api";
import {
  getElectionPhase,
  localToUTC,
  utcToLocalInput,
} from "../../utils/time";

interface ElectionFormState {
  election_name: string;
  description?: string;
  organization_id: number;
  group_id: number;
  start_date: string;
  end_date: string;
}

interface Organization {
  org_id: number;
  name: string;
}

interface group {
  group_id: number;
  group_name: string;
}

interface Position {
  position_id: number;
  position_name: string;
}

export default function ElectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<ElectionFormState>({
    election_name: "",
    description: "",
    organization_id: 0,
    group_id: 0,
    start_date: "",
    end_date: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [groups, setgroups] = useState<group[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [positionsOpen, setPositionsOpen] = useState(false);

  const [phase, setPhase] = useState<"Upcoming" | "Ongoing" | "Past">(
    "Upcoming"
  );
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

    api
      .get("/positions/")
      .then((res) => setPositions(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.organization_id) return;
    api
      .get(`/groups/?org_id=${form.organization_id}`)
      .then((res) => setgroups(res.data))
      .catch(() => setgroups([]));
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
          group_id: data.group_id,
          start_date: utcToLocalInput(data.start_date),
          end_date: utcToLocalInput(data.end_date),
        });
        setSelectedPositions(
          data.positions?.map((p: any) => p.position_id) || []
        );
        setPhase(getElectionPhase(data.start_date, data.end_date));
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!form.start_date || !form.end_date) return;
    setPhase(
      getElectionPhase(localToUTC(form.start_date), localToUTC(form.end_date))
    );
  }, [form.start_date, form.end_date]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "organization_id") {
      setForm((prev) => ({
        ...prev,
        group_id: 0,
      }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.election_name.trim())
      newErrors.election_name = "Election name is required";
    if (!form.organization_id)
      newErrors.organization_id = "Please select an organization";
    if (!form.group_id) newErrors.group_id = "Please select a group";
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
      group_id: Number(form.group_id),
      start_date: localToUTC(form.start_date),
      end_date: localToUTC(form.end_date),
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
      } else if (err.response?.data?.detail)
        errorMessage = err.response.data.detail;
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
          <Badge
            variant="solid"
            color={
              phase === "Upcoming"
                ? "info"
                : phase === "Ongoing"
                ? "success"
                : "dark"
            }
          >
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
                aria-label="Select organization"
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
              <label className="block text-sm text-gray-500 mb-1">Group</label>
              <select
                id="group_id"
                aria-label="Select group"
                name="group_id"
                value={form.group_id}
                onChange={handleChange}
                disabled={!isEditable || !form.organization_id}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select Group</option>
                {groups.map((p) => (
                  <option key={p.group_id} value={p.group_id}>
                    {p.group_name}
                  </option>
                ))}
              </select>
              {errors.group_id && (
                <p className="text-red-500 text-sm mt-1">{errors.group_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Select Positions
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border px-4 py-3 rounded text-left flex justify-between items-center"
                  onClick={() => setPositionsOpen(!positionsOpen)}
                >
                  {selectedPositions.length
                    ? `Selected (${selectedPositions.length})`
                    : "Select positions"}
                  <span>{positionsOpen ? "▲" : "▼"}</span>
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
                id="description"
                placeholder="Enter a description"
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
                placeholder="Enter a start date"
                type="datetime-local"
                name="start_date"
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
                placeholder="Enter a end date"
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
