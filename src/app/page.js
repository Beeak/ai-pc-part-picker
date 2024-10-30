"use client";

import { useState } from "react";

export default function Home() {
  const [existingParts, setExistingParts] = useState("");
  const [requiredParts, setRequiredParts] = useState("");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ existingParts, requiredParts, budget }),
    });

    const data = await response.json();
    setResult(data.result);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">PC Part Picker</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
      >
        <textarea
          value={existingParts}
          onChange={(e) => setExistingParts(e.target.value)}
          placeholder="Enter your existing parts"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <textarea
          value={requiredParts}
          onChange={(e) => setRequiredParts(e.target.value)}
          placeholder="Enter the parts you need"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter your budget"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
      {result && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md w-full max-w-md">
          <p className="text-gray-700">{result}</p>
        </div>
      )}
    </div>
  );
}
