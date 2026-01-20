import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import api from "../../utils/api";

export default function ElectionProgressCard() {
  const [stats, setStats] = useState({
    total_elections: 0,
    total_votes: 0,
    total_voters: 0,
  });

  useEffect(() => {
    api
      .get("/voters/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  const series = [
    stats.total_voters
      ? Math.round((stats.total_votes / stats.total_voters) * 100)
      : 0,
  ];

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: { type: "radialBar", height: 330, sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -80,
        endAngle: 80,
        hollow: { size: "80%" },
        track: { background: "#E4E7EC", strokeWidth: "100%", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: () => String(stats.total_votes),
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Votes Cast"],
  };

  const [isOpen, setIsOpen] = React.useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Election Progress
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Voting statistics for all elections
            </p>
          </div>

          <div className="relative inline-block">
            <button
              type="button"
              onClick={toggleDropdown}
              aria-label="Open options menu"
            >
              <div className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6"></div>
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {stats.total_elections} elections have been conducted so far.
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Total Elections
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {stats.total_elections}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Total Voters
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {stats.total_voters}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Votes Cast
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {stats.total_votes}
          </p>
        </div>
      </div>
    </div>
  );
}
