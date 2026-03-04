import { useEffect, useState } from "react";
import Toast from "../../components/common/Toast";
import api from "../../utils/api";
import { getElections } from "../Election/electionService";
import ElectionCard from "../../components/cards/ElectionCard";



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

const NPT_OFFSET_MS = 5.75 * 60 * 60 * 1000;

const formatNepalDate = (utcDate: string) => {
  const date = new Date(utcDate);
  const nptDate = new Date(date.getTime() + NPT_OFFSET_MS);
  return nptDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getElectionPhase = (startUTC: string, endUTC: string) => {
  const start = new Date(new Date(startUTC).getTime() + NPT_OFFSET_MS);
  const end = new Date(new Date(endUTC).getTime() + NPT_OFFSET_MS);
  const now = new Date(Date.now() + NPT_OFFSET_MS);

  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Ongoing";
  return "Past";
};

export default function ElectionSection() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const fetchElections = async () => {
  try {
    const res = await getElections();

    const formatted: Election[] = res.data.map((e: any) => {
      let positions: Position[] = [];

      if (Array.isArray(e.positions)) {
        positions = e.positions;
      } else if (typeof e.positions === "string" && e.positions.length > 0) {
        positions = e.positions.split(",").map((name: string, index: number) => ({
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

      const activeElections = formatted.filter(
  (e) => e.status === "Ongoing" || e.status === "Upcoming"
);

setElections(activeElections);
    } catch (error) {
      console.error("Failed to load elections:", error);
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



  return (
    <section id="elections" className="">
    <div className="p-6 w-full bg-gray-100">
       <div className="  mb-5 text-center">
      <h2 className="text-3xl font-bold">Elections</h2>
      <p className="text-xl text-gray-600">Comprehensive voting solution for the college elections.</p>
      </div>

    

      {elections.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No active election available
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {elections.map((election) => (
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
    </section>
  );
}
