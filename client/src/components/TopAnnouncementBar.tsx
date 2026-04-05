export default function TopAnnouncementBar() {
  // Create items with alternating font weights
  const items = Array.from({ length: 24 }, (_, i) => {
    const isEven = i % 2 === 0;
    const weight = isEven ? "font-normal" : "font-bold";
    
    return (
      <span key={i} className="inline-flex items-center whitespace-nowrap">
        <span className={`${weight} tracking-[0.1em] sm:tracking-[0.12em]`}>TRANSPORTE OFICIAL PARA O PLRS 2026</span>
        <span className="mx-3 sm:mx-4 text-amber-300/80 text-[9px] sm:text-xs">✦</span>
      </span>
    );
  });

  return (
    <div
      className="fixed top-0 left-0 w-full z-[60] overflow-hidden select-none h-[36px] sm:h-[40px]"
      style={{
        background: "linear-gradient(90deg, #991b1b, #7f1d1d, #991b1b)",
      }}
    >
      <div 
        className="flex items-center h-full animate-marquee"
      >
        <span className="text-white text-[10px] sm:text-xs uppercase inline-flex items-center">
          {items}
        </span>
        <span className="text-white text-[10px] sm:text-xs uppercase inline-flex items-center">
          {items}
        </span>
      </div>
    </div>
  );
}
