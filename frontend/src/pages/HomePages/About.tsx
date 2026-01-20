import React from "react";
import votepic from "./../../assets/vote.png";

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="w-full bg-gradient-to-b from-gray-50 to-gray-100 py-16"
    >
      <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between max-w-[1440px] mx-auto gap-6 md:gap-12 px-4 md:px-8">
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={votepic}
            alt="About VoiceU"
            className="rounded-3xl shadow-xl object-cover w-4/5 md:w-3/4 h-64 md:h-[350px]"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 md:space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            About <span className="text-blue-500">VoiceU</span>
          </h2>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            VoiceU is a comprehensive digital voting system designed for
            organizations of all types. It ensures{" "}
            <span className="font-semibold text-blue-500">
              secure, fair, and transparent
            </span>{" "}
            elections by leveraging modern technologies and reliable
            verification mechanisms.
          </p>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            With real-time voting insights, structured candidate profiles, and
            automated result processing, VoiceU enables members and
            administrators to participate in a{" "}
            <span className="font-semibold text-blue-500">
              seamless and efficient election process
            </span>
            .
          </p>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed">
            Our platform prioritizes{" "}
            <span className="font-semibold text-blue-500">
              security, trust, and transparency
            </span>
            , empowering organizations to conduct elections with confidence and
            integrity every time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
