"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
// import { Switch } from "@/components/ui/switch"; // Uncomment if you add the Switch component
import { Label } from "@/components/ui/label";

// Temporary fallback for Switch if not present
function Switch({ checked, onCheckedChange, id }: { checked: boolean; onCheckedChange: (v: boolean) => void; id: string }) {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={e => onCheckedChange(e.target.checked)}
      className="w-10 h-6 rounded-full border border-gray-300 bg-gray-200 appearance-none checked:bg-blue-500 transition-colors cursor-pointer"
      style={{ verticalAlign: 'middle' }}
    />
  );
}

export default function MediaQueryDebug() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [breakpoint, setBreakpoint] = useState("");

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 640) setBreakpoint("xs");
      else if (width < 768) setBreakpoint("sm");
      else if (width < 1024) setBreakpoint("md");
      else if (width < 1280) setBreakpoint("lg");
      else if (width < 1536) setBreakpoint("xl");
      else setBreakpoint("2xl");
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 bg-white/80 rounded-lg shadow p-2">
        <Switch
          id="debug-toggle"
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
        <Label htmlFor="debug-toggle">Show Debug</Label>
      </div>
      {isEnabled && (
        <Card className="p-4 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="text-sm">
            <div>Breakpoint: <span className="font-bold">{breakpoint}</span></div>
            <div>Width: <span className="font-bold">{windowWidth}px</span></div>
          </div>
        </Card>
      )}
    </div>
  );
}