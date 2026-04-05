export default function TopAnnouncementBar() {
  // Single unit that will be repeated for the infinite loop
  // Alternating font weights for visual rhythm
  const unit = (
    <>
      <span className="font-normal tracking-[0.12em]">TRANSPORTE OFICIAL</span>
      <span className="mx-2 text-amber-300/80 text-[10px] sm:text-xs">•</span>
      <span className="font-bold tracking-[0.12em]">PARA O PLRS 2026</span>
      <span className="mx-4 text-amber-300/80 text-[10px] sm:text-xs">✦</span>
    </>
  );

  // Repeat enough times to fill wide screens seamlessly
  const items = Array.from({ length: 20 }, (_, i) => (
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
      <div 
        className="flex items-center h-full whitespace-nowrap"
        style={{
          animation: "marquee 40s linear infinite",
        }}
      >
        <span className="text-white text-[11px] sm:text-xs uppercase inline-flex items-center">
          {items}
        </span>
        <span className="text-white text-[11px] sm:text-xs uppercase inline-flex items-center">
          {items}
        </span>
      </div>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
