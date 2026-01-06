import { useCallback, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  FolderIcon,
  BoxIconLine,
  GroupIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const mainItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
];

const adminItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "Users",
    path: "/users",
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
];

const managementItems: NavItem[] = [
  {
    name: "Organization",
    icon: <GroupIcon />,
    subItems: [
      { name: "Add Organization", path: "/organization/new" },
      { name: "View Organizations", path: "/organization" },
    ],
  },
  {
    name: "Program",
    icon: <FolderIcon />,
    subItems: [
      { name: "Add Program", path: "/program/new" },
      { name: "View Programs", path: "/program" },
    ],
  },
  {
    name: "Affiliation",
    icon: <BoxIconLine />,
    subItems: [
      { name: "Add Affiliation", path: "/affiliation/new" },
      { name: "View Affiliations", path: "/affiliation" },
    ],
  },
];

const electionItems: NavItem[] = [
  {
    name: "Position",
    icon: <ListIcon />,
    subItems: [
      { name: "Add Position", path: "/position/new" },
      { name: "View Positions", path: "/position" },
    ],
  },
  {
    name: "Election",
    icon: <TableIcon />,
    subItems: [
      { name: "Add Election", path: "/election/new" },
      { name: "View Elections", path: "/election" },
    ],
  },
  {
    name: "Candidate",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "Add Candidate", path: "/candidate/new" },
      { name: "View Candidates", path: "/candidate" },
    ],
  },
  {
    name: "Voter",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "Add Voter", path: "/voter/new" },
      { name: "View Voters", path: "/voter" },
    ],
  },
];

const accessItems: NavItem[] = [
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    section: string;
    index: number;
  } | null>(null);

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const handleToggle = (section: string, index: number) => {
    setOpenSubmenu((prev) =>
      prev?.section === section && prev.index === index
        ? null
        : { section, index }
    );
  };

  const renderSection = (
    title: string,
    items: NavItem[],
    sectionKey: string
  ) => (
    <div>
      <h2
        className={`mb-4 text-xs uppercase text-gray-400 ${
          !isExpanded && !isHovered ? "lg:text-center" : ""
        }`}
      >
        {isExpanded || isHovered || isMobileOpen ? title : <HorizontaLDots />}
      </h2>

      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <>
                <button
                  type="button"
                  onClick={() => handleToggle(sectionKey, index)}
                  className="menu-item menu-item-inactive"
                >
                  <span className="menu-item-icon-size">{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span
                      className={`ml-auto transition-transform ${
                        openSubmenu?.section === sectionKey &&
                        openSubmenu.index === index
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      <ChevronDownIcon />
                    </span>
                  )}
                </button>

                <div
                  ref={(el: HTMLDivElement | null) => {
                    subMenuRefs.current[`${sectionKey}-${index}`] = el;
                  }}
                  className={`overflow-hidden transition-all ${
                    openSubmenu?.section === sectionKey &&
                    openSubmenu.index === index
                      ? "max-h-96"
                      : "max-h-0"
                  }`}
                >
                  <ul className="ml-9 mt-2 space-y-1">
                    {nav.subItems.map((sub) => (
                      <li key={sub.name}>
                        <Link
                          to={sub.path}
                          className={`menu-dropdown-item ${
                            isActive(sub.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span className="menu-item-icon-size">{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r transition-all ${
        isExpanded || isHovered ? "w-[290px]" : "w-[90px]"
      }`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-6 px-5 flex items-center justify-center lg:justify-start">
        <Link
          to="/"
          className="flex items-center justify-center gap-1 font-extrabold"
        >
          {isExpanded || isHovered ? (
            <>
              <span className="text-blue-700 dark:text-blue-500 text-4xl">
                Voice<span className="text-gray-900 dark:text-white">U</span>
              </span>
              <img
                src="/images/logo/Dashboardlogo.svg"
                alt="VoiceU Logo"
                className="h-14 w-14"
              />
            </>
          ) : (
            <img
              src="/images/logo/Dashboardlogo.svg"
              alt="VoiceU Logo"
              className="h-8 w-8"
            />
          )}
        </Link>
      </div>

      <nav className="p-5 space-y-6 overflow-y-auto">
        {renderSection("Main", mainItems, "main")}
        {renderSection("Admin", adminItems, "admin")}
        {renderSection("Management", managementItems, "management")}
        {renderSection("Election System", electionItems, "election")}
        {renderSection("Access", accessItems, "access")}
      </nav>
    </aside>
  );
};

export default AppSidebar;
