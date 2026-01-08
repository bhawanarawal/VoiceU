import React from "react";
import Navbar from "../../layout/Navbar";
import HomeSection from "./HomeSection";
import Services from "./Services";
import Elections from "./Elections";
import About from "./About";
import Contact from "./Contact";
import Nav from "../../layout/Nav";
import ServiceSection from "./ServiceSection";
import background from "./../../assets/HomeBackground.jpg"
import Footer from "../../layout/Footer";
import Overlay from "./Overlay";

const HomeDashboard: React.FC = ()=> {
    
     return (
        

    <div className="relative z-10">
      {/* Fixed Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center z-[-1]"
       style={{ backgroundImage: `url(${background})` }}
      ></div>
      <Nav />
     <main className="pt-16">
        {/* You can make sections semi-transparent if you want */}
        <div className="bg-white bg-opacity-80">
          <HomeSection />
        </div>

        <div className="bg-white/30  rounded-lg shadow-lg">
          <ServiceSection />
        </div>


        <div className="bg-white bg-opacity-80">
          <Elections />
        </div>

        <div className="bg-white bg-opacity-80">
          <About />
        </div>
        <div className="bg-white/30  rounded-lg shadow-lg">
          <Overlay />
        </div>

        <div className="bg-white bg-opacity-80">
          <Contact />
        </div>
         <div className="bg-white bg-opacity-80">
          <Footer />
        </div>
      </main>
    </div>
  );

}
export default HomeDashboard;