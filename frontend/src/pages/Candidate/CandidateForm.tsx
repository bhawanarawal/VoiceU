import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import { getElections } from "../Election/electionService";
import { getPositions } from "../Position/positionService";
import {
  getCandidateById,
  createCandidate,
  updateCandidate,
} from "./candidateService";
import axios from "axios";

interface CandidateFormState {
  user_id: number;
  election_id: number;
  position_id: number;
  manifesto: string;
  photo_url?: string;
}

interface User {
  user_id: number;
  username: string;
  full_name?: string;
}

interface Election {
  election_id: number;
  election_name: string;
}

interface Position {
  position_id: number;
  position_name: string;
}

export default function CandidateForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<CandidateFormState>({
    user_id: 0,
    election_id: 0,
    position_id: 0,
    manifesto: "",
    photo_url: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, electionsRes, positionsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/auth/users"),
          getElections(),
          getPositions(),
        ]);

        setUsers(usersRes.data);
        setElections(electionsRes.data);
        setPositions(positionsRes.data);

        if (id) {
          const res = await getCandidateById(Number(id));
          setForm(res.data);
        }
      } catch (err) {
        setToast({ message: "Failed to load data", type: "error" });
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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
    setPhotoName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!form.user_id) newErrors.user_id = "User is required";
    if (!form.election_id) newErrors.election_id = "Election is required";
    if (!form.position_id) newErrors.position_id = "Position is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("user_id", String(form.user_id));
    formData.append("election_id", String(form.election_id));
    formData.append("position_id", String(form.position_id));
    formData.append("manifesto", form.manifesto);

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    setLoading(true);

    try {
      if (id) {
        await updateCandidate(Number(id), formData);
        setToast({ message: "Candidate updated", type: "success" });
      } else {
        await createCandidate(formData);
        setToast({ message: "Candidate created", type: "success" });
      }

      setTimeout(() => navigate("/candidate"), 700);
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Failed to save candidate",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title={id ? "Edit Candidate" : "Add Candidate"}
        description="Candidate form"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Candidate" : "Add Candidate"} />

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title="Candidate Information">
          <div className="space-y-6">
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

            <div>
              <label
                htmlFor="election_id"
                className="block text-sm text-gray-500"
              >
                Election
              </label>
              <select
                id="election_id"
                name="election_id"
                value={form.election_id}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select election</option>
                {elections.map((e) => (
                  <option key={e.election_id} value={e.election_id}>
                    {e.election_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="position_id"
                className="block text-sm text-gray-500"
              >
                Position
              </label>
              <select
                id="position_id"
                name="position_id"
                value={form.position_id}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select position</option>
                {positions.map((p) => (
                  <option key={p.position_id} value={p.position_id}>
                    {p.position_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="manifesto"
                className="block text-sm text-gray-500"
              >
                Manifesto
              </label>
              <textarea
                id="manifesto"
                name="manifesto"
                value={form.manifesto}
                onChange={handleChange}
                className="w-full border px-4 py-3 rounded"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500">
                Candidate Photo
              </label>

              <div className="flex items-center gap-4 mt-1">
                <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoChange}
                  />
                </label>

                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                  {photoName || "No file selected"}
                </span>
              </div>

              {(photoPreview || form.photo_url) && (
                <img
                  src={photoPreview || form.photo_url}
                  alt="Preview"
                  className="mt-4 h-32 w-32 object-cover rounded border"
                />
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/candidate")}>
                Back
              </Button>
              <Button
                variant="primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading
                  ? "Saving..."
                  : id
                  ? "Update Candidate"
                  : "Save Candidate"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
