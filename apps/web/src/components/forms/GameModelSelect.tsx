'use client';
import { GAME_MODEL_OPTIONS, DEFAULT_GAME_MODEL_ID, type GameModelId } from "@/lib/gameModels.client";

type Props = {
  value?: GameModelId;
  onChange?: (v: GameModelId) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  size?: "sm" | "md";
};

export default function GameModelSelect({
  value = DEFAULT_GAME_MODEL_ID,
  onChange,
  label = "Game Model",
  helperText,
  disabled,
  size = "md",
}: Props) {
  const cls = size === "sm"
    ? "w-full rounded-lg border px-2 py-1 text-sm"
    : "w-full rounded-xl border px-3 py-2 text-sm";

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        className={cls}
        value={value}
        onChange={(e) => onChange?.(e.target.value as GameModelId)}
        disabled={disabled}
      >
        {GAME_MODEL_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name} — {opt.philosophy}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-gray-500">{helperText}</p> : null}
    </div>
  );
}
