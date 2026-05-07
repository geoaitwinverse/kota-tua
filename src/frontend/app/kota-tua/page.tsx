import dynamic from "next/dynamic";
import { ErrorBoundary } from "./ErrorBoundary";

const KotaTuaView = dynamic(() => import("./kotaTuaView"), {
  ssr: false,
});

export default function KotaTuaPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <ErrorBoundary>
        <KotaTuaView />
      </ErrorBoundary>
    </main>
  );
}
