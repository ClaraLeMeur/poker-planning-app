"use client";

const CARD_FILES: Record<string, string> = {
  "0,5": "0-5.svg",
  "1": "1.svg",
  "2": "2.svg",
  "3": "3.svg",
  "4": "4.svg",
  "8": "8.svg",
  "13": "13.svg",
  "20": "20.svg",
  "40": "40.svg",
  "100": "100.svg",
  "?": "question.svg",
  "pause": "pause.svg",
};

export type CardColor = "blue" | "green" | "red" | "yellow";

type Props = {
  value: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  color?: CardColor;
};

export default function PokerCard({ value, selected, disabled, onClick, color = "blue" }: Props) {
  const file = CARD_FILES[value];
  const svgSrc = file ? `/cards/${color}/${file}` : null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`
        relative w-16 h-24 rounded-sm transition-all duration-150 select-none
        ${disabled ? "opacity-50 cursor-default" : "cursor-pointer hover:-translate-y-1 hover:shadow-lg active:translate-y-0"}
        ${selected ? "-translate-y-2 ring-4 ring-blue-400 ring-offset-2 shadow-xl" : "shadow-md"}
      `}
    >
      {svgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={svgSrc}
          alt={`Card ${value}`}
          className="w-full h-full rounded-sm object-cover"
          draggable={false}
        />
      ) : (
        <FallbackCard value={value} selected={selected} />
      )}
    </button>
  );
}

function FallbackCard({ value, selected }: { value: string; selected: boolean }) {
  return (
    <div
      className={`
        w-full h-full rounded-xl flex items-center justify-center
        font-bold text-xl border-2
        ${selected
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-blue-700 border-blue-300"
        }
      `}
    >
      {value}
    </div>
  );
}
