const rows = [
  ["0x0000", "4A 43 45 45 4C 41 42 53 2E 53 59 53 54 45 4D 53", "JCEELABS.SYSTEMS"],
  ["0x0010", "56 4F 57 00 01 00 00 10 20 26 08 7A 11 00 00 00", "VOW..... .&.z...."],
  ["0x0020", "45 56 49 44 45 4E 43 45 2E 52 45 43 4F 52 44 45", "EVIDENCE.RECORDE"],
  ["0x0030", "44 00 50 52 4F 56 45 44 00 53 54 41 54 45 00 31", "D.PROVED.STATE.1"],
  ["0x0040", "9A 7B 2D 18 6C 57 1B 8E 90 00 00 10 20 30 40 50", ".{-.lW...... 0@P"],
  ["0x0050", "AA BB CC DD EE FF 10 32 45 67 89 AB CD EF 00 11", ".......2Eg......"],
  ["0x0060", "12 34 56 78 9A BC DE F0 00 11 22 33 44 55 66 77", ".4Vx......\"3DUfw"],
  ["0x0070", "88 99 AA BB CC DD EE FF 01 23 45 67 89 AB CD EF", ".........#Eg...."],
  ["0x0080", "FE DC BA 98 76 54 32 10 0F 1E 2D 3C 4B 5A 69 78", "....vT2...-<KZix"],
  ["0x0090", "87 96 A5 B4 C3 D2 E1 F0 0E 1D 2C 3B 4A 59 68 77", "..........,;JYhw"],
];

export default function HexInspector() {
  return (
    <aside className="hex-inspector" aria-label="Live JCEE Labs evidence hex inspector">
      <div className="hex-inspector-topbar">
        <div className="hex-window-status"><i /> LIVE MEMORY / EVIDENCE VIEW</div>
        <div className="hex-window-meta">READ ONLY · SHA-256</div>
      </div>

      <div className="hex-table" role="table" aria-label="Hexadecimal evidence data">
        <div className="hex-table-head" role="row">
          <span>OFFSET</span>
          <span>00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span>
          <span>ASCII</span>
        </div>
        <div className="hex-table-body">
          {rows.map(([offset, bytes, ascii], index) => (
            <div className={`hex-table-row ${index === 0 ? "is-selected" : ""}`} role="row" key={offset}>
              <code>{offset}</code>
              <code>{bytes}</code>
              <code>{ascii}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="hex-inspector-wave" aria-hidden="true">
        <svg viewBox="0 0 900 44" preserveAspectRatio="none">
          <path d="M0 25 C40 12 75 36 115 23 S190 14 230 26 S302 34 345 21 S425 11 470 27 S540 35 585 20 S655 10 705 24 S785 37 835 19 S875 15 900 22" />
        </svg>
      </div>

      <div className="hex-inspector-footer">
        <div><span>SELECTION</span><strong>0x0000–0x000F</strong></div>
        <div><span>VALUE / HEX</span><strong>4A 43 45 45 4C 41 42 53</strong></div>
        <div><span>VALUE / ASCII</span><strong>JCEELABS</strong></div>
      </div>
    </aside>
  );
}
