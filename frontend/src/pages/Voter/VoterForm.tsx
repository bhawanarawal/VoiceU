import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import { getVoterById, createVoter, updateVoter } from "./voterService";
import axios from "axios";

interface VoterFormState {
  user_id: number;
  org_id: number;
  affiliation_id: number;
  affiliation_level: string;
}

interface User {
  user_id: number;
  username: string;
  full_name?: string;
}

interface Organization {
  org_id: number;
  name: string;
}

interface Affiliation {
  affiliation_id: number;
  affiliation_name: string;
  org_id: number; // important: affiliation should have org_id
}

export default function VoterForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<VoterFormState>({
    user_id: 0,
    org_id: 0,
    affiliation_id: 0,
    affiliation_level: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allAffiliations, setAllAffiliations] = useState<Affiliation[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, orgRes, affRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/auth/users"),
          axios.get("http://127.0.0.1:8000/organizations/"),
          axios.get("http://127.0.0.1:8000/affiliations/"),
        ]);

        setUsers(usersRes.data);
        setOrganizations(orgRes.data);
        setAllAffiliations(affRes.data);

        if (id) {
          const res = await getVoterById(Number(id));
          setForm({
            user_id: res.data.user_id,
            org_id: res.data.org_id,
            affiliation_id: res.data.affiliation_id,
            affiliation_level: res.data.affiliation_level || "",
          });

          // Filter affiliations for the selected org
          const filtered = affRes.data.filter(
            (a: Affiliation) => a.org_id === res.data.org_id
          );
          setAffiliations(filtered);
        }
      } catch {
        setToast({ message: "Failed to load data", type: "error" });
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value, tagName } = e.target;
    const newValue = tagName === "SELECT" ? Number(value) : value;

    setForm({ ...form, [name]: newValue });
    setErrors({ ...errors, [name]: "" });

    if (name === "org_id") {
      // Filter affiliations based on selected organization
      const filtered = allAffiliations.filter(
        (a) => a.org_id === Number(value)
      );
      setAffiliations(filtered);

      // Reset affiliation selection when org changes
      setForm((prev) => ({ ...prev, affiliation_id: 0 }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.user_id) newErrors.user_id = "User is required";
    if (!form.org_id) newErrors.org_id = "Organization is required";
    if (!form.affiliation_id)
      newErrors.affiliation_id = "Affiliation is required";
    if (!form.affiliation_level)
      newErrors.affiliation_level = "Affiliation level is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (id) {
        await updateVoter(Number(id), payload);
        setToast({ message: "Voter updated", type: "success" });
      } else {
        await createVoter(payload);
        setToast({ message: "Voter created", type: "success" });
      }
      setTimeout(() => navigate("/voter"), 700);
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Failed to save voter",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title={id ? "Edit Voter" : "Add Voter"}
        description="Voter form"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Voter" : "Add Voter"} />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title="Voter Information">
          <div className="space-y-6">
            {/* User */}
            <div>
              <label htmlFor="user_id" className="block text-sm text-gray-500">
                User
              </label>
              <select
                id="user_id"
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select user</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name || u.username}
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="text-red-500 text-sm">{errors.user_id}</p>
              )}
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="org_id" className="block text-sm text-gray-500">
                Organization
              </label>
              <select
                id="org_id"
                name="org_id"
                value={form.org_id}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select organization</option>
                {organizations.map((o) => (
                  <option key={o.org_id} value={o.org_id}>
                    {o.name}
                  </option>
                ))}
              </select>
              {errors.org_id && (
                <p className="text-red-500 text-sm">{errors.org_id}</p>
              )}
            </div>

            {/* Affiliation */}
            <div>
              <label
                htmlFor="affiliation_id"
                className="block text-sm text-gray-500"
              >
                Affiliation
              </label>
              <select
                id="affiliation_id"
                name="affiliation_id"
                value={form.affiliation_id}
                onChange={handleChange}
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
                <p className="text-red-500 text-sm">{errors.affiliation_id}</p>
              )}
            </div>

            {/* Affiliation Level */}
            <div>
              <label className="block text-sm text-gray-500">
                Affiliation Level
              </label>
              <input
                type="text"
                name="affiliation_level"
                value={form.affiliation_level}
                onChange={handleChange}
                placeholder="Enter affiliation level"
                className="w-full border px-4 py-3 rounded"
              />
              {errors.affiliation_level && (
                <p className="text-red-500 text-sm">
                  {errors.affiliation_level}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/voter")}>
                Back
              </Button>
              <Button
                variant="primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? "Saving..." : id ? "Update Voter" : "Save Voter"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
