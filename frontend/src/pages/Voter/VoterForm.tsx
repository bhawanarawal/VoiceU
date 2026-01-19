import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Toast from "../../components/common/Toast";
import {
  getMyVoter,
  createVoter,
  getOrganizations,
  getgroupsByOrg,
} from "./voterService";
import Footer from "../../layout/Footer";
import Nav from "../../layout/Nav";

interface VoterFormState {
  org_id: number;
  group_ids: number[];
}

interface Organization {
  org_id: number;
  name: string;
}

interface Group {
  group_id: number;
  group_name: string;
}

type FormErrors = {
  org_id?: string;
  group_ids?: string;
};

export default function VoterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<VoterFormState>({
    org_id: 0,
    group_ids: [],
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await getMyVoter();
        const currentUser = userRes.data;

        setFullName(currentUser.full_name || "");
        setUsername(currentUser.username || "");

        if (currentUser.voter_id) {
          setIsRegistered(true);
          setToast({
            message: "You are already registered as a voter",
            type: "success",
          });

          const orgRes = await getOrganizations();
          const groupRes = await getgroupsByOrg(currentUser.org_id);

          setOrganizations(orgRes.data);
          setFilteredGroups(groupRes.data);

          setForm({
            org_id: currentUser.org_id,
            group_ids: currentUser.groups?.map((g: any) => g.group_id) || [],
          });

          return;
        }

        const orgRes = await getOrganizations();
        setOrganizations(orgRes.data);
      } catch (err: any) {
        setToast({
          message: err.response?.data?.detail || "Failed to load data",
          type: "error",
        });
      }
    };

    loadData();
  }, []);

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = Number(e.target.value);
    setForm({ org_id: orgId, group_ids: [] });
    setErrors((prev) => ({ ...prev, org_id: "" }));

    getgroupsByOrg(orgId).then((res) => setFilteredGroups(res.data));
  };

  const handleGroupCheckbox = (groupId: number, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      group_ids: checked
        ? [...prev.group_ids, groupId]
        : prev.group_ids.filter((id) => id !== groupId),
    }));
    setErrors((prev) => ({ ...prev, group_ids: "" }));
  };

  const handleSubmit = async () => {
    const newErrors: FormErrors = {};
    if (!form.org_id) newErrors.org_id = "Organization is required";
    if (form.group_ids.length === 0)
      newErrors.group_ids = "Select at least one group";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await createVoter(form);
      setToast({ message: "Applied for voter registration", type: "success" });
      setTimeout(() => navigate("/Home"), 1000);
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
    <>
      <Nav />
      <div>
        <main className="flex-1 pt-30 pb-20 ">
          <PageMeta
            title="Register as Voter"
            description="Voter registration"
          />

          {toast && <Toast {...toast} onClose={() => setToast(null)} />}

          <div className="max-w-lg mx-auto mt-6">
            <ComponentCard title="">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Voter Registration</h2>

                {!isRegistered && (
                  <button
                    type="button"
                    onClick={() => navigate("/Home")}
                    className="text-gray-400 hover:text-gray-800 text-xl font-bold"
                    title="Register later"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-500">Email</label>
                  <input
                    id="username"
                    placeholder="Email"
                    type="text"
                    value={username}
                    readOnly
                    className="w-full border px-4 py-3 rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500">
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    placeholder="Full Name"
                    type="text"
                    value={fullName}
                    readOnly
                    className="w-full border px-4 py-3 rounded bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500">
                    Organization
                  </label>
                  <select
                    name="org_id"
                    aria-label="Select Organization"
                    value={form.org_id}
                    onChange={handleOrgChange}
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
                  <label className="block text-sm text-gray-500">Groups</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full border px-4 py-3 rounded flex justify-between items-center bg-white"
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      disabled={isRegistered}
                    >
                      {form.group_ids.length
                        ? `${form.group_ids.length} selected`
                        : "Select Groups"}
                      <span className="ml-2">&#9662;</span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 border rounded bg-white max-h-60 overflow-y-auto shadow-lg">
                        {filteredGroups.map((g) => (
                          <label
                            key={g.group_id}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={form.group_ids.includes(g.group_id)}
                              onChange={(e) =>
                                handleGroupCheckbox(
                                  g.group_id,
                                  e.target.checked,
                                )
                              }
                              disabled={isRegistered}
                            />
                            {g.group_name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.group_ids && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.group_ids}
                    </p>
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
        </main>
      </div>
      <Footer />
    </>
  );
}
