import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AccessGuard } from "@/components/AccessGuard";

function PrototypeBanner() {
  return (
    <div className="prototype-banner">
      Prototype. Synthetic data. Extraction and assistant are simulated. Rule
      checks run live.
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell-wrapper">
      <PrototypeBanner />
      <div className="shell">
        <Sidebar />
        <div className="main-wrapper">
          <TopBar />
          <main className="content-area">
            <div className="content-inner">
              <AccessGuard>{children}</AccessGuard>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
