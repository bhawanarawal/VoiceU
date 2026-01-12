import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import {
  getMyVoter,
  createVoter,
  getOrganizations,
  getgroupsByOrg,
  getSemestersBygroup,
  getAffiliationsByOrg,
} from "./voterService";

interface VoterFormState {
  user_id: number;
  full_name: string;
  org_id: number;
  group_id: number;
  semester_id: number;
  affiliation_id: number;
}

interface Organization {
  org_id: number;
  name: string;
  affiliation_id?: number;
}

interface group {
  group_id: number;
  group_name: string;
}

interface Semester {
  semester_id: number;
  semester_number: number;
}

interface Affiliation {
  affiliation_id: number;
  affiliation_name: string;
}

type FormErrors = {
  org_id?: string;
  group_id?: string;
  semester_id?: string;
  affiliation_id?: string;
};

export default function VoterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<VoterFormState>({
    user_id: 0,
    full_name: "",
    org_id: 0,
    group_id: 0,
    semester_id: 0,
    affiliation_id: 0,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredgroups, setFilteredgroups] = useState<group[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  const [filteredAffiliations, setFilteredAffiliations] = useState<
    Affiliation[]
  >([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await getMyVoter();
        const currentUser = userRes.data;

        if (currentUser.voter_id) {
          setIsRegistered(true);
          setToast({
            message: "You are already registered as a voter",
            type: "success",
          });

          const [progRes, semRes, affRes, orgRes] = await Promise.all([
            getgroupsByOrg(currentUser.org_id),
            getSemestersBygroup(currentUser.group_id),
            getAffiliationsByOrg(currentUser.org_id),
            getOrganizations(),
          ]);

          let affiliations: Affiliation[] = affRes.data;

          if (
            currentUser.affiliation_id &&
            !affiliations.find(
              (a: Affiliation) =>
                a.affiliation_id === currentUser.affiliation_id
            )
          ) {
            affiliations.push({
              affiliation_id: currentUser.affiliation_id,
              affiliation_name:
                currentUser.affiliation_name || "Registered Affiliation",
            });
          }

          setOrganizations(orgRes.data);
          setFilteredgroups(progRes.data);
          setFilteredSemesters(semRes.data);
          setFilteredAffiliations(affiliations);

          setForm({
            user_id: currentUser.user_id,
            full_name: currentUser.full_name,
            org_id: currentUser.org_id,
            group_id: currentUser.group_id,
            semester_id: currentUser.semester_id,
            affiliation_id: currentUser.affiliation_id || 0,
          });

          return;
        }

        const orgRes = await getOrganizations();
        setOrganizations(orgRes.data);
        setForm({
          user_id: currentUser.user_id,
          full_name: currentUser.full_name,
          org_id: 0,
          group_id: 0,
          semester_id: 0,
          affiliation_id: 0,
        });
      } catch (err: any) {
        setToast({
          message: err.response?.data?.detail || "Failed to load data",
          type: "error",
        });
      }
    };

    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericValue = Number(value);

    setForm((prev) => ({ ...prev, [name]: numericValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "org_id") {
      const selectedOrg = organizations.find((o) => o.org_id === numericValue);

      // Automatically select the organization’s affiliation if exists
      setForm((prev) => ({
        ...prev,
        org_id: numericValue,
        affiliation_id: selectedOrg?.affiliation_id || 0,
        group_id: 0,
        semester_id: 0,
      }));

      getgroupsByOrg(numericValue).then((res) => setFilteredgroups(res.data));
      getAffiliationsByOrg(numericValue).then((res) =>
        setFilteredAffiliations(res.data)
      );
      setFilteredSemesters([]);
    }

    if (name === "group_id") {
      getSemestersBygroup(numericValue).then((res) =>
        setFilteredSemesters(res.data)
      );
      setForm((prev) => ({ ...prev, semester_id: 0 }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    if (!form.org_id) newErrors.org_id = "Organization is required";
    if (!form.group_id) newErrors.group_id = "group is required";
    if (!form.semester_id) newErrors.semester_id = "Semester is required";
    if (!form.affiliation_id)
      newErrors.affiliation_id = "Affiliation is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createVoter(form);
      setToast({ message: "Voter registered successfully", type: "success" });
      setTimeout(() => navigate("/voter"), 1000);
    } catch (err: any) {
      setToast({
        message: err.response?.data?.detail || "Registration failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta title="Register as Voter" description="Voter registration" />
      <PageBreadcrumb pageTitle="Voter Registration" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title="Voter Registration">
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-500">Full Name</label>
              <input
                id="full_name"
                aria-label="Full Name"
                type="text"
                name="full_name"
                value={form.full_name}
                readOnly
                className="w-full border px-4 py-3 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500">
                Organization
              </label>
              <select
                id="organization"
                aria-label="Organization"
                name="org_id"
                value={form.org_id}
                onChange={handleChange}
                disabled={isRegistered}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select Organization</option>
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

            <div>
              <label className="block text-sm text-gray-500">group</label>
              <select
                id="group"
                aria-label="group"
                name="group_id"
                value={form.group_id}
                onChange={handleChange}
                disabled={isRegistered}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select group</option>
                {filteredgroups.map((p) => (
                  <option key={p.group_id} value={p.group_id}>
                    {p.group_name}
                  </option>
                ))}
              </select>
              {errors.group_id && (
                <p className="text-red-500 text-sm">{errors.group_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500">Semester</label>
              <select
                id="semester"
                aria-label="Semester"
                name="semester_id"
                value={form.semester_id}
                onChange={handleChange}
                disabled={isRegistered}
                className="w-full border px-4 py-3 rounded"
              >
                <option value={0}>Select Semester</option>
                {filteredSemesters.map((s) => (
                  <option key={s.semester_id} value={s.semester_id}>
                    {s.semester_number}
                  </option>
                ))}
              </select>
              {errors.semester_id && (
                <p className="text-red-500 text-sm">{errors.semester_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500">Affiliation</label>
              <select
                id="affiliation"
                aria-label="Affiliation"
                name="affiliation_id"
                value={form.affiliation_id}
                onChange={handleChange}
                disabled={isRegistered}
                className="w-full border px-4 py-3 rounded"
              >
                {form.affiliation_id !== 0 && (
                  <option value={form.affiliation_id}>
                    {filteredAffiliations.find(
                      (a) => a.affiliation_id === form.affiliation_id
                    )?.affiliation_name || "Affiliation"}
                  </option>
                )}
              </select>
              {errors.affiliation_id && (
                <p className="text-red-500 text-sm">{errors.affiliation_id}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || isRegistered}
              >
                {isRegistered
                  ? "Already Registered"
                  : loading
                  ? "Registering..."
                  : "Register as Voter"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
