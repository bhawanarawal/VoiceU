import { useState, useEffect } from "react";
import Logo from "../assets/background.png";

const sections = ["home", "services", "elections", "about", "contact"];

const Nav = () => {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      for (let section of sections) {
        const el = document.getElementById(section);
        if (el) {
          if (
            scrollPos >= el.offsetTop &&
            scrollPos < el.offsetTop + el.offsetHeight
          ) {
            setActive(section);
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (section: string) => {
    const el = document.getElementById(section);
    el?.scrollIntoView({ behavior: "smooth" });
    setActive(section);
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

        <nav className="hidden md:flex items-center gap-8 font-medium">
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

          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow">
            Login
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
