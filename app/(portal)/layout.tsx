import Sidebar from "@/components/Sidebar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">{children}</main>
    </div>
  );
}
