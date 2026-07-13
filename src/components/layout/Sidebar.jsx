import FocusFeed from "@/components/sidebar/FocusFeed";
import StatisticsChart from "@/components/sidebar/StatisticsChart";

export default function Sidebar() {
  return (
    <div className="space-y-6">
      <FocusFeed />
      <div>
        <p className="font-heading font-semibold text-sm mb-3">Task Statistics</p>
        <StatisticsChart />
      </div>
    </div>
  );
}