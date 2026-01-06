import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import { createCandidate } from "./candidateService";
import api from "../../utils/api";

interface Position {
  position_id: number;
  position_name: string;
}

interface CandidateFormState {
  user_id: number;
  election_id: number;
  position_id: number;
  manifesto: string;
  photo_url?: string;

  username?: string;
  election_name?: string;
  program_name?: string;
  organization_name?: string;
  affiliation_name?: string;
}

export default function CandidateForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<CandidateFormState>({
    user_id: 0,
    election_id: 0,
    position_id: 0,
    manifesto: "",
    photo_url: "",
  });

  const [positions, setPositions] = useState<Position[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/auth/users/me");
        const user = res.data;

        setForm((prev) => ({
          ...prev,
          user_id: user.user_id,
          username: user.full_name || user.username,
        }));
      } catch {
        setToast({ message: "Failed to load user", type: "error" });
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadElection = async () => {
      const query = new URLSearchParams(location.search);
      const electionId = query.get("electionId");

      if (!electionId) return;

      try {
        const res = await api.get(`/elections/${electionId}`);
        const election = res.data;

        const electionPositions: Position[] = Array.isArray(election.positions)
          ? election.positions
          : [];

        setPositions(electionPositions);

        setForm((prev) => ({
          ...prev,
          election_id: election.election_id,
          election_name: election.election_name,
          program_name: election.program_name || "",
          organization_name: election.organization_name || "",
          affiliation_name: election.affiliation_name || "",
          position_id:
            electionPositions.length > 0 ? electionPositions[0].position_id : 0,
        }));
      } catch (err) {
        console.error(err);
        setToast({
          message: "Failed to load election details",
          type: "error",
        });
      }
    };

    loadElection();
  }, [location.search]);

  const handleManifestoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, manifesto: e.target.value });
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, position_id: Number(e.target.value) });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ message: "Only image files allowed", type: "error" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "Image must be under 2MB", type: "error" });
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.position_id) {
      setToast({ message: "Please select a position", type: "error" });
      return;
    }

    if (!form.manifesto) {
      setToast({ message: "Manifesto is required", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("user_id", String(form.user_id));
    formData.append("election_id", String(form.election_id));
    formData.append("position_id", String(form.position_id));
    formData.append("manifesto", form.manifesto);
    if (photoFile) formData.append("photo", photoFile);

    setLoading(true);
    try {
      await createCandidate(formData);
      setToast({
        message: "Candidate applied successfully",
        type: "success",
      });
      setTimeout(() => navigate("/candidate"), 800);
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Failed to apply",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta title="Apply as Candidate" description="" />
      <PageBreadcrumb pageTitle="Apply as Candidate" />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title="Candidate Application">
          <div className="space-y-5">
            <Input label="Username" value={form.username} />
            <Input label="Election" value={form.election_name} />
            <Input label="Program" value={form.program_name} />
            <Input label="Organization" value={form.organization_name} />
            <Input label="Affiliation" value={form.affiliation_name} />

            {/* POSITION DROPDOWN */}
            <div>
              <label className="text-sm text-gray-500">Position</label>
              <select
                id="position"
                name="position"
                aria-label="Position"
                value={form.position_id}
                onChange={handlePositionChange}
                className="w-full border px-4 py-3 rounded"
              >
                {positions.map((p) => (
                  <option key={p.position_id} value={p.position_id}>
                    {p.position_name}
                  </option>
                ))}
              </select>
            </div>

            {/* MANIFESTO */}
            <div>
              <label className="text-sm text-gray-500">Manifesto</label>
              <textarea
                id="manifesto"
                name="manifesto"
                aria-label="Manifesto"
                rows={4}
                value={form.manifesto}
                onChange={handleManifestoChange}
                className="w-full border px-4 py-3 rounded"
              />
            </div>

            {/* PHOTO */}
            <div>
              <label className="text-sm text-gray-500">Photo</label>
              <label className="block mt-1 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer w-fit">
                Choose Image
                <input hidden type="file" onChange={handlePhotoChange} />
              </label>

              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-3 h-32 w-32 rounded object-cover border"
                />
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/candidate")}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Apply"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

function Input({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <input
        id="name"
        name="name"
        placeholder="Enter the name"
        type="text"
        value={value || ""}
        disabled
        className="w-full border px-4 py-3 rounded bg-gray-100"
      />
    </div>
  );
}
