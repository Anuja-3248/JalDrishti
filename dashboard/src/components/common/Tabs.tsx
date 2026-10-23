interface TabDef {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 border-b border-stroke px-2 pt-2">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-t px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              isActive
                ? "border border-b-0 border-stroke bg-cream-light text-sonar shadow-card"
                : "text-ink-muted hover:text-ink-dark hover:bg-raised/40"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
