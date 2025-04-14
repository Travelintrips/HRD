import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface GeofenceSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  resultsCount?: number;
  showResultsCount?: boolean;
  onEnterPress?: () => void;
}

const GeofenceSearchBar: React.FC<GeofenceSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Search locations...",
  resultsCount,
  showResultsCount = true,
  onEnterPress,
}) => {
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
          aria-label="Search locations"
        />
        {searchQuery && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {showResultsCount &&
        searchQuery &&
        typeof resultsCount !== "undefined" && (
          <div className="text-sm text-gray-500">
            Found {resultsCount} location{resultsCount !== 1 ? "s" : ""}
          </div>
        )}
    </div>
  );
};

export default GeofenceSearchBar;
