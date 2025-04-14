import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GeofenceLocation } from "./GeofenceLocationTable";
import L from "leaflet";
import GeofenceSearchBar from "./GeofenceSearchBar";

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface GeofenceMapViewProps {
  locations: GeofenceLocation[];
  onLocationSelect?: (location: GeofenceLocation) => void;
  selectedLocation?: GeofenceLocation | null;
  editMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

// Component to recenter the map when selectedLocation changes
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const GeofenceMapView: React.FC<GeofenceMapViewProps> = ({
  locations,
  onLocationSelect,
  selectedLocation,
  editMode = false,
  onMapClick,
  className,
  searchPlaceholder = "Search locations...",
  searchQuery: externalSearchQuery,
  setSearchQuery: externalSetSearchQuery,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<
    GeofenceLocation[]
  >([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = React.useRef<L.Map | null>(null);

  // Use external or internal search query based on what's provided
  const searchQuery =
    externalSearchQuery !== undefined
      ? externalSearchQuery
      : internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery || setInternalSearchQuery;

  // Initialize filtered locations when component mounts or locations change
  useEffect(() => {
    setFilteredLocations(locations || []);
  }, [locations]);

  // Filter locations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(locations);
    } else {
      const query = searchQuery.toLowerCase().trim();

      // More lenient search - check if query is contained anywhere in the string
      const filtered = locations.filter((location) => {
        if (!location) return false;

        const nameMatch = location.name
          ? location.name.toLowerCase().includes(query)
          : false;
        const addressMatch = location.address
          ? location.address.toLowerCase().includes(query)
          : false;

        return nameMatch || addressMatch;
      });

      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  // Set initial map center based on locations or default to a central position
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.latitude, selectedLocation.longitude]);
    } else if (filteredLocations && filteredLocations.length > 0) {
      // Center on the first location if no selected location
      setMapCenter([
        filteredLocations[0].latitude,
        filteredLocations[0].longitude,
      ]);
    } else if (locations && locations.length > 0) {
      // Fall back to all locations if filtered is empty
      setMapCenter([locations[0].latitude, locations[0].longitude]);
    } else {
      // Default center (can be customized based on your region)
      setMapCenter([-6.2088, 106.8456]); // Jakarta, Indonesia as default
    }
  }, [filteredLocations, locations, selectedLocation]);

  // Function to pan to the first filtered location
  const panToFirstFilteredLocation = () => {
    if (filteredLocations && filteredLocations.length > 0) {
      const firstLocation = filteredLocations[0];
      const newCenter: [number, number] = [
        firstLocation.latitude,
        firstLocation.longitude,
      ];

      // Update the map center state
      setMapCenter(newCenter);

      // If we have a direct reference to the map, use setView instead of flyTo
      // to reduce animation resource usage
      if (mapRef.current) {
        mapRef.current.setView(newCenter, 15);
      }

      // Optionally select the location
      if (onLocationSelect) {
        onLocationSelect(firstLocation);
      }
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (editMode && onMapClick) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  };

  return (
    <div className={`w-full h-full flex flex-col ${className || ""}`}>
      <div className="mb-3">
        <GeofenceSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={searchPlaceholder}
          resultsCount={filteredLocations.length}
          onEnterPress={panToFirstFilteredLocation}
        />
      </div>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%", borderRadius: "0.375rem" }}
        whenCreated={(map) => {
          mapRef.current = map;
          if (editMode) {
            map.on("click", handleMapClick);
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Only render MapController when needed to reduce re-renders */}
        {selectedLocation && <MapController center={mapCenter} />}

        {filteredLocations.map((location) => (
          <React.Fragment key={location.id}>
            <Marker
              key={`marker-${location.id}`}
              position={[location.latitude, location.longitude]}
              eventHandlers={{
                click: () => onLocationSelect && onLocationSelect(location),
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-medium">{location.name}</h3>
                  <p className="text-sm">{location.address}</p>
                  <p className="text-xs mt-1">Radius: {location.radius}m</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              key={`circle-${location.id}`}
              center={[location.latitude, location.longitude]}
              radius={location.radius}
              pathOptions={{
                color:
                  selectedLocation?.id === location.id ? "#2563eb" : "#6b7280",
                fillColor:
                  selectedLocation?.id === location.id ? "#3b82f6" : "#9ca3af",
                fillOpacity: 0.2,
                weight: selectedLocation?.id === location.id ? 3 : 1,
              }}
              eventHandlers={{
                click: () => onLocationSelect && onLocationSelect(location),
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default GeofenceMapView;
