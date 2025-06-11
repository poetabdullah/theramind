// LoadingPlaceholder.jsx
import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingPlaceholder() {
  return (
    <div className="p-8 text-center text-gray-500">
      <Loader2 className="mx-auto mb-4 w-12 h-12 animate-spin text-purple-600" />
      <h2 className="mb-6 text-xl font-medium text-gray-700">
        Loading previous plans
      </h2>
      <div className="space-y-6">
        {[...Array(2)].map((_, idx) => (
          <div
            key={idx}
            className="h-64 rounded-2xl bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
