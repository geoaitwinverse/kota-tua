import dynamic from "next/dynamic";

const KotaTuaView = dynamic(() => import("./kotaTuaView"), {
  ssr: false,
});

export default function KotaTuaPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <KotaTuaView />
    </main>
  );
}
