import { useEffect, useState } from "react";
import ElectionCard from "../../components/cards/ElectionCard";
import { getElections } from "./electionService";
import Toast from "../../components/common/Toast";

interface Position {
  position_id: number;
  position_name: string;
}

interface Election {
  election_id: number;
  election_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  positions: Position[];
  program_name?: string;
  organization_name?: string;
  affiliation_name?: string;
  status: "Upcoming" | "Ongoing" | "Past";
}

const formatNepalDate = (utcDate: string) => {
  const date = new Date(utcDate);
  const nptOffset = 5.75 * 60;
  const nptDate = new Date(date.getTime() + nptOffset * 60 * 1000);

  return nptDate.toLocaleString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getElectionPhase = (startUTC: string, endUTC: string) => {
  const nptOffset = 5.75 * 60 * 60 * 1000;
  const start = new Date(new Date(startUTC).getTime() + nptOffset);
  const end = new Date(new Date(endUTC).getTime() + nptOffset);
  const now = new Date(new Date().getTime() + nptOffset);

  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Ongoing";
  return "Past";
};

export default function ElectionPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const [activeTab, setActiveTab] = useState<
    "All" | "Ongoing" | "Upcoming" | "Past"
  >("All");

  const fetchElections = async () => {
    try {
      const res = await getElections();
      const formatted: Election[] = res.data.map((e: any) => {
        let positions: Position[] = [];
        if (Array.isArray(e.positions)) positions = e.positions;
        else if (typeof e.positions === "string" && e.positions.length > 0) {
          positions = e.positions
            .split(",")
            .map((name: string, index: number) => ({
              position_id: index,
              position_name: name.trim(),
            }));
        }

        return {
          election_id: e.election_id,
          election_name: e.election_name,
          description: e.description,
          start_date: formatNepalDate(e.start_date),
          end_date: formatNepalDate(e.end_date),
          positions,
          program_name: e.program_name,
          organization_name: e.organization_name,
          affiliation_name: e.affiliation_name,
          status: getElectionPhase(e.start_date, e.end_date),
        };
      });

      const statusOrder: Record<string, number> = {
        Ongoing: 0,
        Upcoming: 1,
        Past: 2,
      };

      formatted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

      setElections(formatted);
    } catch (error) {
      setToastMessage("Failed to load elections");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  if (loading)
    return <div className="text-center mt-10">Loading elections...</div>;

  const phases: ("All" | "Ongoing" | "Upcoming" | "Past")[] = [
    "All",
    "Ongoing",
    "Upcoming",
    "Past",
  ];

  const filteredElections =
    activeTab === "All"
      ? elections
      : elections.filter((e) => e.status === activeTab);

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">Elections</h1>

      <div className="flex justify-center mb-6 gap-4">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setActiveTab(phase)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              activeTab === phase
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {filteredElections.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No {activeTab.toLowerCase()} elections available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredElections.map((election) => (
            <ElectionCard
              key={election.election_id}
              electionId={election.election_id}
              title={election.election_name}
              description={election.description}
              startDateTime={election.start_date}
              endDateTime={election.end_date}
              positions={election.positions}
              program={election.program_name}
              organization={election.organization_name}
              affiliation={election.affiliation_name}
              status={election.status}
            />
          ))}
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
