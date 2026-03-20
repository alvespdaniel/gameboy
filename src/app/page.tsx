import GameBoy from "@/components/GameBoy";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#2a2a2e",
      }}
    >
      <GameBoy />
    </main>
  );
}
