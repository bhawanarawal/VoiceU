import { useCallback, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  TableIcon,
  UserCircleIcon,
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
  { icon: <GridIcon />, name: "Dashboard", path: "/" },
];

const adminItems: NavItem[] = [
  { icon: <UserCircleIcon />, name: "Users", path: "/users" },
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
    name: "group",
    icon: <BoxIconLine />,
    subItems: [
      { name: "Add group", path: "/group/new" },
      { name: "View groups", path: "/group" },
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
    subItems: [{ name: "View Candidates", path: "/candidate" }],
  },
  {
    name: "Voter",
    icon: <UserCircleIcon />,
    subItems: [{ name: "View Voters", path: "/voter" }],
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
    [location.pathname],
  );

  const handleToggle = (section: string, index: number) => {
    setOpenSubmenu((prev) =>
      prev?.section === section && prev.index === index
        ? null
        : { section, index },
    );
  };

  const renderSection = (
    title: string,
    items: NavItem[],
    sectionKey: string,
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
                  className="menu-item menu-item-inactive flex items-center w-full"
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
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openSubmenu?.section === sectionKey &&
                    openSubmenu.index === index
                      ? "max-h-screen"
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
      className={`fixed top-0 left-0 h-screen flex flex-col bg-white border-r transition-all ${
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

      <nav
        className="flex-1 overflow-y-auto p-5 space-y-6
  scrollbar-thin scrollbar-thumb-white-900 scrollbar-track-gray-700"
      >
        {renderSection("Main", mainItems, "main")}
        {renderSection("Admin", adminItems, "admin")}
        {renderSection("Management", managementItems, "management")}
        {renderSection("Election System", electionItems, "election")}
      </nav>
    </aside>
  );
};

export default AppSidebar;
