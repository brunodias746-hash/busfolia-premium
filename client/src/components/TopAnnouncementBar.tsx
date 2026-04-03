export default function TopAnnouncementBar() {
  const text =
    "TRANSPORTE OFICIAL PARA O PLRS 2026 \u2022 GARANTA SUA VAGA \u2022 \u00daLTIMAS VAGAS \u2022 ";

  // Repeat text enough times to fill wide screens
  const repeated = Array(12).fill(text).join("");

  return (
    <div
      className="fixed top-0 left-0 w-full z-[60] overflow-hidden select-none"
      style={{
        height: "40px",
        background: "linear-gradient(90deg, #b91c1c, #7f1d1d, #b91c1c)",
      }}
    >
      <div className="flex items-center h-full animate-marquee whitespace-nowrap">
        <span className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wider">
          {repeated}
        </span>
        <span className="text-white text-xs sm:text-sm font-semibold uppercase tracking-wider">
          {repeated}
        </span>
      </div>
    </div>
  );
}
