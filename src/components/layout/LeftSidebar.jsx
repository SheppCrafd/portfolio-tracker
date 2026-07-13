import StakeholderList from "@/components/sidebar/StakeholderList";

export default function LeftSidebar() {
  return (
    <div>
      <p className="font-heading font-semibold text-sm mb-3">Stakeholders</p>
      <StakeholderList />
    </div>
  );
}