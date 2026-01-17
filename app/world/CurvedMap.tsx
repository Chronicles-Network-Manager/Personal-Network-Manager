"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L, { LatLngExpression, Marker as LeafletMarker, Polyline as LeafletPolyline } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Contact } from "@/types/contact";
import { getDataForContactsSection } from "../Services/CRMService";
import { useTheme } from "next-themes";

const iconUrl = "https://cdn-icons-png.flaticon.com/512/252/252025.png";

const currentIcon = L.icon({
  iconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const pastIcon = L.icon({
  iconUrl,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  className: "grey-marker",
});

// Helper: get great circle curve points between two coordinates
function getGreatCirclePoints(start: number[], end: number[], segments = 100): LatLngExpression[] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(start[0]),
    lon1 = toRad(start[1]);
  const lat2 = toRad(end[0]),
    lon2 = toRad(end[1]);
  const dist =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
      )
    );

  const points: LatLngExpression[] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * dist) / Math.sin(dist);
    const B = Math.sin(f * dist) / Math.sin(dist);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDeg(Math.atan2(y, x));
    points.push([lat, lon]);
  }
  return points;
}

const CurvedMapLogic: React.FC = () => {
  const map = useMap();
  const [data, setData] = useState<Contact[]>([]);
  
    useEffect(() => {
      async function fetchData() {
        const { data, error } = await getDataForContactsSection();
        if (error) console.error(error);
        else setData(data ?? []);
      }
  
      fetchData();
    }, []);
  
    console.log("Contacts data:", data);

  // State for which marker is selected
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Keep refs to markers, past markers, polylines for cleanup
  const markersRef = useRef<LeafletMarker[]>([]);
  const pastMarkersRef = useRef<LeafletMarker[]>([]);
  const polylinesRef = useRef<LeafletPolyline[]>([]);

  useEffect(() => {
  if (!map || data.length === 0) return;

  // Clear old markers
  markersRef.current.forEach((m) => m.remove());
  markersRef.current = [];

  data.forEach(contact => {
      const pos: LatLngExpression = [contact.location.latitude, contact.location.longitude];
      const marker = L.marker(pos, { icon: currentIcon });

      marker.addTo(map);

      marker.on("click", () => {
        setSelectedContactId(contact.userId);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map, data]);  // <== Add data here


  // Effect for selected contact changes
  useEffect(() => {
    if (!map) return;

    // Clear past markers and polylines
    pastMarkersRef.current.forEach((m) => m.remove());
    pastMarkersRef.current = [];
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    if (selectedContactId === null) {
      // Reset all markers to full opacity and re-enable click
      markersRef.current.forEach((m) => {
        m.setOpacity(1);
        m.off("click-disabled"); // Just in case
        m.getElement()?.classList.remove("disabled-marker");
        // Re-add click handlers
        // Since original click handlers are set in first useEffect,
        // no need to rebind here; React Leaflet manages marker recreation.
      });
      map.closePopup();
      return;
    }

    // Find selected contact
    const selectedContact = data.find((c) => c.userId === selectedContactId);
    if (!selectedContact) return;

    const pos: LatLngExpression = [selectedContact.location.latitude, selectedContact.location.longitude];

    // Show popup with close button inside
    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
      <div>
        <b>${selectedContact.firstName}</b><br/>
        ${selectedContact.jobTitle} at ${selectedContact.company}<br/>
        <button id="close-popup-btn" style="margin-top:8px;">Close ✖</button>
      </div>
    `;

    const popup = L.popup({ closeOnClick: false, autoClose: false })
      .setLatLng(pos)
      .setContent(popupContent)
      .openOn(map);

    // Close button handler
    popupContent.querySelector("#close-popup-btn")?.addEventListener("click", () => {
      setSelectedContactId(null);
      map.closePopup();
    });

    // Make other markers translucent and disable clicks
    markersRef.current.forEach((marker) => {
      const markerPos = marker.getLatLng();
      if (markerPos.lat === pos[0] && markerPos.lng === pos[1]) {
        // Selected marker normal
        marker.setOpacity(1);
        marker.getElement()?.classList.remove("disabled-marker");
        // No click disable
      } else {
        marker.setOpacity(0.3);
        marker.getElement()?.classList.add("disabled-marker");
        // Disable pointer events (clicks)
      }
    });

    // Add past markers and arcs for selected contact
    selectedContact.pastLocations.forEach((pastLoc, i) => {
      const pastLatLng: LatLngExpression = [pastLoc.latitude, pastLoc.longitude];
      const pastMarker = L.marker(pastLatLng, { icon: pastIcon })
        .addTo(map)
        .bindPopup(`${selectedContact.firstName} - Past #${i + 1}`);

      pastMarkersRef.current.push(pastMarker);

      const curve = getGreatCirclePoints(
        [selectedContact.location.latitude, selectedContact.location.longitude],
        [pastLoc.latitude, pastLoc.longitude],
        50
      );

      const polyline = L.polyline(curve, {
        color: "#555",
        weight: 2,
        dashArray: "5, 5",
      }).addTo(map);

      polylinesRef.current.push(polyline);
    });
  }, [selectedContactId, map]);

  return null;
};

// CSS to disable pointer events on disabled markers and apply black/white map styling
const MapStyle: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <style>
    {`
      .disabled-marker {
        pointer-events: none !important;
        cursor: default !important;
      }
      .grey-marker img {
        filter: grayscale(80%) brightness(70%);
      }
      .leaflet-tile-container img {
        filter: grayscale(100%) ${isDark ? 'invert(1)' : 'brightness(0.9)'};
      }
    `}
  </style>
);

const CurvedMap: React.FC = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Determine if we're in dark mode
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <MapStyle isDark={isDark} />
      <MapContainer
        center={[30, 20]}
        zoom={3}
        minZoom={3}
        style={{ height: "100%", width: "100%" }}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
          subdomains="abcd"
          maxZoom={19}
          noWrap={true}
        />
        <ZoomControl position="bottomright" />
        <CurvedMapLogic />
      </MapContainer>
    </>
  );
};

export default CurvedMap;
