import React, { useEffect, useState } from "react";
import BackgroundImage from "./../../assets/HomeBackground.jpg";
import ProgressCard from "./ProgressCard";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const HomeSection: React.FC = () => {
  const navigate = useNavigate();

  const [totalVoters, setTotalVoters] = useState(0);
  const [totalElections, setTotalElections] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await api.get("/voters/stats");
      setTotalVoters(res.data.total_voters);
      setTotalElections(res.data.total_elections);
      setTotalVotes(res.data.total_votes);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const features = [
    {
      title: "Total   Voters",
      number: totalVoters,
      description: "Registered voters",
    },
    {
      title: "Total Elections",
      number: totalElections,
      description: "All Elections",
    },
    {
      title: "Total Vote Cast",
      number: totalVotes,
      description: "Votes completed",
    },
  ];

  return (
    <section id="home" className="relative w-full overflow-hidden">
      <div
        className="relative w-full h-[550px] md:h-[650px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-sm"></div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-3xl px-6 space-y-6 animate-hero">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Click <span className="text-blue-400">• Vote •</span> Change
          </h1>
          <p className="text-white text-lg md:text-xl">
            Every voice matters. Every story deserves a stage. At VoiceU, we
            make your words count.
          </p>
          <button
            onClick={() => navigate("/elections")}
            className="px-8 py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-gray-900 font-semibold rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Share Your Voice
          </button>
        </div>
      </div>

      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {features.map((feature, i) => (
              <ProgressCard
                key={i}
                title={feature.title}
                percentage={feature.number}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes heroSlide {
            0% {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .animate-hero {
            animation: heroSlide 2s ease-out forwards;
          }
        `}
      </style>
    </section>
  );
};

export default HomeSection;
