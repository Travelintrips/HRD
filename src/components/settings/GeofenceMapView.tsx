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
import L from "leaflet";
import { GeofenceLocation } from "./GeofenceLocationTable";

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface GeofenceMapViewProps {
  locations: GeofenceLocation[];
  selectedLocation: GeofenceLocation | null;
  onLocationSelect: (location: GeofenceLocation) => void;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

// Component to handle map center changes
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export default function GeofenceMapView({
  locations,
  selectedLocation,
  onLocationSelect,
  onMapClick,
  interactive = false,
}: GeofenceMapViewProps) {
  const defaultCenter: [number, number] = [-6.2088, 106.8456]; // Jakarta
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (selectedLocation) {
      setCenter([selectedLocation.latitude, selectedLocation.longitude]);
      setZoom(15);
    } else if (locations.length > 0) {
      setCenter([locations[0].latitude, locations[0].longitude]);
    }
  }, [selectedLocation, locations]);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onMapClick && interactive) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      whenCreated={(map) => {
        if (interactive) {
          map.on("click", handleMapClick);
        }
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={center} zoom={zoom} />

      {locations.map((location) => (
        <React.Fragment key={location.id}>
          <Circle
            center={[location.latitude, location.longitude]}
            radius={location.radius}
            pathOptions={{
              fillColor:
                selectedLocation?.id === location.id ? "#2563eb" : "#3b82f6",
              fillOpacity: 0.3,
              color:
                selectedLocation?.id === location.id ? "#1d4ed8" : "#60a5fa",
              weight: 2,
            }}
            eventHandlers={{
              click: () => onLocationSelect(location),
            }}
          />
          <Marker
            position={[location.latitude, location.longitude]}
            eventHandlers={{
              click: () => onLocationSelect(location),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{location.name}</h3>
                <p>{location.address}</p>
                <p>Radius: {location.radius}m</p>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}
    </MapContainer>
  );
}
