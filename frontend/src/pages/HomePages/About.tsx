import React from "react";
import votepic from "./../../assets/vote.png"


const About: React.FC = () => {
  return (
      <section id="about" className="min-h-screen bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10">
        
        {/* Left Side - Image */}
        <div className="md:w-1/2 w-full flex justify-center">
          <img
            src={votepic}
            alt="About VoiceU"
            className="rounded-2xl shadow-lg object-cover w-full h-80 md:h-[400px]"
          />
        </div>

        {/* Right Side - Text */}
        <div className="md:w-1/2 w-full flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            About VoiceU
          </h2>
          <p className="text-gray-700 text-lg mb-4">
            VoiceU is a comprehensive digital voting system designed for college elections. 
            It ensures secure, fair, and transparent elections by leveraging modern technologies 
            and blockchain verification.
          </p>
          <p className="text-gray-700 text-lg mb-4">
            With real-time voting statistics, interactive candidate profiles, and automated results, 
            VoiceU makes it easier for students and administrators to participate in a seamless election process.
          </p>
          <p className="text-gray-700 text-lg">
            Our platform prioritizes security, engagement, and transparency, empowering students to 
            make their voices heard and ensuring fair elections every time.
          </p>
        </div>

      </div>
    </section>
  );
};

export default About;