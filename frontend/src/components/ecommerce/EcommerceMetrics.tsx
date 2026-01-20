import { useEffect, useState } from "react";
import { ArrowUpIcon, BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import api from "../../utils/api";

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalElections: 0,
    totalVoters: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [electionsRes, votersRes] = await Promise.all([
          api.get("/elections/"),
          api.get("/voters/"),
        ]);

        setMetrics({
          totalElections: electionsRes.data.length,
          totalVoters: votersRes.data.length,
        });
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <div className="text-gray-800 size-6 dark:text-white/90">
            <BoxIconLine />
          </div>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Elections
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.totalElections}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            5%
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <div className="text-gray-800 size-6 dark:text-white/90">
            <GroupIcon />
          </div>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Voters
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.totalVoters}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            6%
          </Badge>
        </div>
      </div>
    </div>
  );
}
