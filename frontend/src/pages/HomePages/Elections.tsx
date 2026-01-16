import axios from "axios";
import React, { useEffect, useState } from "react";

export type Candidate = {
  candidate_id: number;
  candidate_name: string;
  manifesto: string;
  photo?: string;
};

export type Election = {
  election_id: number;
  election_name: string;
  status: "active" | "completed" | "upcoming";
  description?: string;
  start_date: string;
  end_date: string;
  candidates?: Candidate[];
};

const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get("http://localhost:8000/elections");
        setElections(res.data);
      } catch (err) {
        console.error("Error fetching elections:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">Loading elections...</p>
      </div>
    );
  }

  const visibleElections = elections.filter(
    (e) => e.status === "active" || e.status === "upcoming"
  );

  const ElectionCard: React.FC<{ election: Election }> = ({ election }) => (
    <div className="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden relative">
      <span
        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
          election.status === "active"
            ? "bg-green-500 text-white"
            : "bg-yellow-500 text-white"
        }`}
      >
        {election.status.toUpperCase()}
      </span>

      <div className="bg-blue-600 p-4">
        <h3 className="text-white text-xl font-bold">
          {election.election_name}
        </h3>
      </div>

      <div className="bg-white p-6 flex flex-col gap-4">
        <p className="text-gray-800">
          {election.description || "No description provided."}
        </p>

        <div className="flex justify-between text-gray-700 text-sm">
          <span>
            <strong>Start:</strong>{" "}
            {new Date(election.start_date).toLocaleDateString()}
          </span>
          <span>
            <strong>End:</strong>{" "}
            {new Date(election.end_date).toLocaleDateString()}
          </span>
        </div>

        <div className="text-gray-700 text-sm">
          <strong>Candidates Registered:</strong>{" "}
          {election.candidates?.length || 0}
        </div>

        <button className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
          View Candidates
        </button>

        {election.status === "active" && (
          <button className="w-full mt-2 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors">
            Vote Now
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section id="elections" className="  p-4 bg-gray-100 py-16">
      <div className="  mb-5 text-center">
        <h2 className="text-3xl font-bold">Elections</h2>
        <p className="text-xl text-gray-600">
          Comprehensive voting solution for the college elections.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleElections.map((election) => (
          <ElectionCard key={election.election_id} election={election} />
        ))}
      </div>
    </section>
  );
};

export default Elections;
