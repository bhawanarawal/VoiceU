import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [full_name, setFullName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const response = await api.get("/auth/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.full_name) {
          setFullName(response.data.full_name);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setFullName("User");
      }
    };

    fetchUser();
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    window.dispatchEvent(new Event("auth-changed"));

    navigate("/Home");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <div className="mr-3 h-11 w-11 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg">
            {getInitials(full_name)}
          </span>
        </div>

        <span className="block mr-1 font-medium text-theme-sm">
          Welcome, {full_name}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[220px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-2 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {getInitials(full_name)}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-400">
              {full_name}
            </span>
          </li>

          <li>
            <DropdownItem
              tag="a"
              to="/voter/new"
              onItemClick={closeDropdown}
              className="px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Voter Registration
            </DropdownItem>
          </li>

          <li>
            <button
              onClick={() => {
                closeDropdown();
                handleLogout();
              }}
              className="px-3 py-2 text-left rounded-lg hover:bg-red-50 text-red-600"
            >
              Sign out
            </button>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
