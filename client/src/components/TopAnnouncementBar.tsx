export default function TopAnnouncementBar() {
  // Create items with alternating font weights
  // Each item is: [full phrase with weight] + [separator]
  const items = Array.from({ length: 24 }, (_, i) => {
    const isEven = i % 2 === 0;
    const weight = isEven ? "font-normal" : "font-bold";
    
    return (
      <span key={i} className="inline-flex items-center whitespace-nowrap">
        <span className={`${weight} tracking-[0.12em]`}>TRANSPORTE OFICIAL PARA O PLRS 2026</span>
        <span className="mx-4 text-amber-300/80 text-[10px] sm:text-xs">✦</span>
      </span>
    );
  });

  return (
    <div
      className="fixed top-0 left-0 w-full z-[60] overflow-hidden select-none"
      style={{
        height: "40px",
        background: "linear-gradient(90deg, #991b1b, #7f1d1d, #991b1b)",
      }}
    >
      <div 
        className="flex items-center h-full"
        style={{
          animation: "marquee 60s linear infinite",
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
