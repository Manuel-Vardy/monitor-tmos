import { INSTITUTION_TYPES, type InstitutionType } from "@/lib/institution-types";
import { INSTITUTION_META } from "@/lib/institution-config";

interface InstitutionSelectorProps {
  value: InstitutionType | null;
  onChange: (type: InstitutionType) => void;
  error?: string;
}

export function InstitutionSelector({ value, onChange, error }: InstitutionSelectorProps) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {INSTITUTION_TYPES.map((type) => {
          const meta = INSTITUTION_META[type];
          const Icon = meta.icon;
          const isSelected = value === type;

          return (
            <button
              key={type}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(type)}
              className={[
                "flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors",
                isSelected
                  ? "border-accent bg-accent/15 ring-1 ring-accent"
                  : "border-border hover:bg-secondary/70",
              ].join(" ")}
            >
              <Icon className="size-8" />
              <p className="font-semibold text-sm">{meta.label}</p>
              <p className="text-xs text-muted-foreground leading-snug">{meta.description}</p>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
