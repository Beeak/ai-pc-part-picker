"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Slider from "@radix-ui/react-slider";
import * as Label from "@radix-ui/react-label";
import { CheckIcon } from "@radix-ui/react-icons";

export default function Home() {
  const partOptions = [
    "CPU",
    "GPU",
    "Motherboard",
    "RAM",
    "Storage",
    "PSU",
    "Case",
    "Cooling",
  ];
  const [buildType, setBuildType] = useState("new");
  const [existingParts, setExistingParts] = useState("");
  const [requiredParts, setRequiredParts] = useState([]);
  const [budget, setBudget] = useState(1500);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      if (budget < 100) {
        throw new Error("Budget must be at least $100");
      }

      if (buildType === "upgrade" && !existingParts.trim()) {
        throw new Error("Please enter your existing parts");
      }

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buildType,
          budget,
          existingParts: buildType === "upgrade" ? existingParts : null,
          requiredParts: buildType === "upgrade" ? requiredParts : [],
          estimatedExistingValue: 0, // Add this required field
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate build");
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <h1 className="text-4xl font-bold mb-6 text-white">PC Part Picker</h1>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6">
        <Tabs.Root defaultValue={buildType} onValueChange={setBuildType}>
          <Tabs.List
            className="flex p-1 mb-6 bg-slate-800/50 rounded-lg"
            aria-label="Build type"
          >
            <Tabs.Trigger
              value="new"
              className="flex-1 px-4 py-2 text-sm font-medium text-white/70 rounded-md transition-all duration-200 
              data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              New Build
            </Tabs.Trigger>
            <Tabs.Trigger
              value="upgrade"
              className="flex-1 px-4 py-2 text-sm font-medium text-white/70 rounded-md transition-all duration-200
              data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Upgrade Existing
            </Tabs.Trigger>
          </Tabs.List>

          <form onSubmit={handleSubmit} className="space-y-6">
            {buildType === "upgrade" && (
              <div className="space-y-4">
                <div>
                  <Label.Root className="block text-sm font-medium text-white/90 mb-1">
                    Existing Parts
                  </Label.Root>
                  <textarea
                    value={existingParts}
                    onChange={(e) => setExistingParts(e.target.value)}
                    placeholder="Enter your existing parts by name"
                    className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 
                    focus:ring-indigo-500 text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <Label.Root className="block text-sm font-medium text-white/90 mb-2">
                    Required Parts
                  </Label.Root>
                  <div className="grid grid-cols-2 gap-3">
                    {partOptions.map((part) => (
                      <div key={part} className="flex items-center space-x-2">
                        <Checkbox.Root
                          id={part}
                          checked={requiredParts.includes(part)}
                          onCheckedChange={(checked) => {
                            setRequiredParts(
                              checked
                                ? [...requiredParts, part]
                                : requiredParts.filter((p) => p !== part)
                            );
                          }}
                          className="w-5 h-5 rounded-md bg-slate-800/50 border border-slate-700 transition-all duration-200
                          hover:bg-slate-700/50 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        >
                          <Checkbox.Indicator className="flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Label.Root
                          htmlFor={part}
                          className="text-sm text-white/90"
                        >
                          {part}
                        </Label.Root>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label.Root className="block text-sm font-medium text-white/90 mb-2">
                Budget: ${budget}
              </Label.Root>
              <Slider.Root
                min={500}
                max={5000}
                step={100}
                value={[budget]}
                onValueChange={(value) => setBudget(value[0])}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="relative h-1 w-full rounded-full bg-slate-700">
                  <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-5 h-5 bg-white rounded-full shadow-lg border-2 border-indigo-500 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform 
                hover:scale-110"
                />
              </Slider.Root>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg 
              font-medium shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 
              focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              {buildType === "new"
                ? "Generate Build"
                : "Get Upgrade Suggestions"}
            </button>
          </form>
        </Tabs.Root>
      </div>

      {result && (
        <div className="w-full max-w-md mt-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {buildType === "new" ? "Complete Build" : "Suggested Upgrades"}
          </h2>
          <div className="space-y-4">
            {result.parts.map((part, index) => (
              <div key={index} className="border-b border-slate-700/50 pb-2">
                <div className="font-medium text-white/90">{part.type}</div>
                <div className="text-white/70">{part.model}</div>
                <div className="text-indigo-400">${part.estimated_price}</div>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex justify-between text-white/90">
                <span>Total Cost:</span>
                <span className="font-semibold">${result.total_cost}</span>
              </div>
              <div className="flex justify-between text-indigo-400">
                <span>Remaining Budget:</span>
                <span className="font-semibold">
                  ${result.remaining_budget}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
