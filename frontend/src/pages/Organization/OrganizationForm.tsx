import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { getOrganizationById, createOrganization, updateOrganization } from "./organizationService";

export default function OrganizationForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    description: "",
  });


 useEffect(() => {
  if (id) {
    
    async function fetchData() {
      const res = await getOrganizationById(Number(id));
      setForm(res.data);
    }
    fetchData();
  } else {
    
    setForm({
      name: "",
      address: "",
      description: "",
    });
  }
}, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (id) {
      await updateOrganization(Number(id), form);
    } else {
      await createOrganization(form);
    }
    navigate("/organization");
  };

  return (
    <div>
      <PageMeta
        title={id ? "Edit Organization | Dashboard" : "Add Organization | Dashboard"}
        description="Add or edit organization on dashboard"
      />
      <PageBreadcrumb pageTitle={id ? "Edit Organization" : "Add Organization"} />

      <div className="max-w-lg mx-auto mt-6">
        <ComponentCard title={id ? "Organization Information" : "Organization Information"}>
          <div className="space-y-6 justify-center">
            
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter organization address"
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            
            <div>
              <label className="block text-gray-500 dark:text-gray-400 text-sm mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter organization description"
                className="w-full border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 h-48 resize-none"
              />
            </div>

            
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate("/organization")}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
              >
                 {id ? "Update Organization" : "Save Organization"}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
