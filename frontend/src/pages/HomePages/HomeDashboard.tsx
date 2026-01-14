import React from "react";

import Nav from "../../layout/Nav";
import HomeSection from "./HomeSection";
import ServiceSection from "./ServiceSection";
import About from "./About";
import Contact from "./Contact";
import Footer from "../../layout/Footer";

const HomeDashboard: React.FC = () => {
  return (
    <div>
      <Nav />
      <main className="pt-16">
        <HomeSection /> {/* Hero section */}
        <ServiceSection /> {/* Services section */}
        <About /> {/* About section */}
        <Contact /> {/* Contact section */}
        <Footer /> {/* Footer */}
      </main>
    </div>
  );
};

export default HomeDashboard;
