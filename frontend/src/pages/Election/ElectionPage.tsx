import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ElectionCard from "../../components/cards/ElectionCard";
import { getElections } from "./electionService";
import Toast from "../../components/common/Toast";
import Footer from "../../layout/Footer";
import Nav from "../../layout/Nav";

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
  group_name?: string;
  organization_name?: string;
  status: "upcoming" | "ongoing" | "past";
}

const formatNepalDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const nptOffset = 5.75 * 60 * 60 * 1000;
  const nptDate = new Date(utc + nptOffset);

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
  const startUTCDate = new Date(startUTC);
  const endUTCDate = new Date(endUTC);
  const nowUTC = new Date();

  const nptOffset = 5.75 * 60 * 60 * 1000;
  const start = new Date(
    startUTCDate.getTime() +
      startUTCDate.getTimezoneOffset() * 60000 +
      nptOffset,
  );
  const end = new Date(
    endUTCDate.getTime() + endUTCDate.getTimezoneOffset() * 60000 + nptOffset,
  );
  const now = new Date(
    nowUTC.getTime() + nowUTC.getTimezoneOffset() * 60000 + nptOffset,
  );

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "past";
};

export default function ElectionPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<
    "All" | "ongoing" | "upcoming" | "past"
  >(() => {
    const tab = searchParams.get("tab");
    if (tab === "ongoing" || tab === "upcoming" || tab === "past") {
      return tab;
    }
    return "All";
  });

  const fetchElections = async () => {
    try {
      const res = await getElections();
      const formatted: Election[] = res.data.map((e: any) => {
        let positions: Position[] = [];
        if (Array.isArray(e.positions)) {
          positions = e.positions;
        } else if (typeof e.positions === "string" && e.positions.length > 0) {
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
          group_name: e.group_name,
          organization_name: e.organization_name,
          affiliation_name: e.affiliation_name,
          status: getElectionPhase(e.start_date, e.end_date),
        };
      });

      const statusOrder: Record<"ongoing" | "upcoming" | "past", number> = {
        ongoing: 0,
        upcoming: 1,
        past: 2,
      };

      formatted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

      setElections(formatted);
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

  const phases: ("All" | "ongoing" | "upcoming" | "past")[] = [
    "All",
    "ongoing",
    "upcoming",
    "past",
  ];
  const filteredElections =
    activeTab === "All"
      ? elections
      : elections.filter((e) => e.status === activeTab);

  return (
    <>
      <Nav />
      <div className="flex flex-col min-h-screen pt-20">
        <main className="flex-1 p-6 w-full">
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
                  group={election.group_name}
                  organization={election.organization_name}
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
        </main>
      </div>

      <Footer />
    </>
  );
}
