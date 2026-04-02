import { Toaster } from "sonner";
import { requireSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          displayName={session.display_name}
          email={session.email}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
