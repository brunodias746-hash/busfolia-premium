export default function TopAnnouncementBar() {
  // Single unit that will be repeated for the infinite loop
  const unit = (
    <>
      <span className="font-light tracking-[0.15em]">TRANSPORTE OFICIAL PARA O</span>
      {" "}
      <span className="font-extrabold tracking-[0.08em]">PLRS 2026</span>
      <span className="mx-4 text-amber-300/80 text-[10px] sm:text-xs">✦</span>
    </>
  );

  // Repeat enough times to fill wide screens seamlessly
  const items = Array.from({ length: 16 }, (_, i) => (
    <span key={i} className="inline-flex items-center">
      {unit}
    </span>
  ));

  return (
    <div
      className="fixed top-0 left-0 w-full z-[60] overflow-hidden select-none"
      style={{
        height: "40px",
        background: "linear-gradient(90deg, #991b1b, #7f1d1d, #991b1b)",
      }}
    >
      <div className="flex items-center h-full animate-marquee whitespace-nowrap">
        <span className="text-white text-[11px] sm:text-xs uppercase inline-flex items-center">
          {items}
        </span>
        <span className="text-white text-[11px] sm:text-xs uppercase inline-flex items-center">
          {items}
        </span>
      </div>
    </div>
  );
}
