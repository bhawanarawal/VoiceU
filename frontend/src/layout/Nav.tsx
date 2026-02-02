import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/background.png";
import UserDropdown from "../components/header/UserDropdown";
import { FaSignInAlt } from "react-icons/fa";

const sections = ["home", "services", "elections", "about", "contact"];

const Nav = () => {
  const [active, setActive] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };

    checkAuth();

    window.addEventListener("auth-changed", checkAuth);

    return () => {
      window.removeEventListener("auth-changed", checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      for (let section of sections) {
        const el = document.getElementById(section);
        if (
          el &&
          scrollPos >= el.offsetTop &&
          scrollPos < el.offsetTop + el.offsetHeight
        ) {
          setActive(section);
        }
      }
    };
    if (location.pathname === "/elections") {
      setActive("elections");
    }
    if (location.pathname === "/Home") {
      window.addEventListener("scroll", handleScroll);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const handleClick = (section: string) => {
    if (section === "elections") {
      setActive("elections");
      navigate("/elections");
      return;
    }

    if (location.pathname === "/Home") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
      setActive(section);
    } else {
      navigate("/Home");
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white bg-opacity-80 backdrop-blur-md shadow-md z-50">
      <div className="flex justify-between items-center w-full px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-extrabold">
            <span className="text-blue-600">Voice</span>
            <span className="text-black">U</span>
          </h1>
          <img src={Logo} alt="Logo" className="w-14 h-14 object-contain" />
        </div>

        <nav className="hidden md:flex items-center gap-6 font-medium">
          {sections.map((sec) => (
            <div
              key={sec}
              className="relative cursor-pointer px-2 py-1"
              onClick={() => handleClick(sec)}
            >
              <span
                className={`capitalize ${
                  active === sec
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-600"
                }`}
              >
                {sec}
              </span>

              <span
                className={`absolute left-0 -bottom-1 h-1 w-full bg-blue-600 transition-transform duration-300 ${
                  active === sec ? "scale-x-100" : "scale-x-0"
                } origin-left`}
              />
            </div>
          ))}

          {isLoggedIn ? (
            <UserDropdown />
          ) : (
            <button
              onClick={() => navigate("/signin")}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-all duration-200"
              title="Login"
            >
              <FaSignInAlt className="h-6 w-6" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Nav;
