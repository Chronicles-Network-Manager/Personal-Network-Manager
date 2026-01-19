"use client";
import React, { useEffect, useState, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
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
import { PinPopupCard } from "./PinPopupCard";
import { ContactDetailsPanel } from "./ContactDetailsPanel";

const iconUrl = "https://cdn-icons-png.flaticon.com/512/252/252025.png";

const currentIcon = L.icon({
  iconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Grey icon for visited locations
const visitedIcon = L.icon({
  iconUrl,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  className: "grey-marker",
});

// Purple icon for work locations (using divIcon)
const workIcon = L.divIcon({
  html: `<div style="background-color: #9333EA; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  className: "work-marker",
});

// Blue icon for other/past locations
const otherIcon = L.divIcon({
  html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); position: relative; z-index: 1000;"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  className: "other-marker",
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

  // State for which marker is selected
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const selectedContactForPanelRef = useRef<Contact | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const popupRef = useRef<L.Popup | null>(null);

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

    // Cleanup previous popup and root first
    if (popupRef.current) {
      map.closePopup();
      popupRef.current = null;
    }
    
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
      });
      
      // Cleanup popup root after a delay to avoid race conditions
      setTimeout(() => {
        if (popupRootRef.current) {
          popupRootRef.current.unmount();
          popupRootRef.current = null;
        }
        setPanelOpen(false);
        selectedContactForPanelRef.current = null;
      }, 100);
      
      return;
    }

    // Find selected contact
    const selectedContact = data.find((c) => c.userId === selectedContactId);
    if (!selectedContact) return;

    const pos: LatLngExpression = [selectedContact.location.latitude, selectedContact.location.longitude];

    // Clean up any existing popup root before creating a new one
    if (popupRootRef.current) {
      try {
        popupRootRef.current.unmount();
      } catch (e) {
        // Ignore unmount errors if root is already unmounted
      }
      popupRootRef.current = null;
    }

    // Create DOM node for React component
    const popupNode = L.DomUtil.create("div");
    popupNode.style.width = "280px";
    popupNode.style.position = "relative";
    popupNode.style.zIndex = "10003";

    // Create React root and render PinPopupCard
    const root = createRoot(popupNode);
    popupRootRef.current = root;

    // Render the component
    root.render(
      React.createElement(PinPopupCard, {
        contact: selectedContact,
        onShowMore: () => {
          selectedContactForPanelRef.current = selectedContact;
          setPanelOpen(true);
        },
        onClose: () => {
          setSelectedContactId(null);
          map.closePopup();
          setPanelOpen(false);
        },
      })
    );

    // Use setTimeout to ensure React has finished rendering
    const timeoutId = setTimeout(() => {
      // Create popup with minimal Leaflet styling - we'll style everything in React
      const popup = L.popup({ 
        closeOnClick: false, 
        autoClose: false,
        closeButton: false, // Disable Leaflet's close button - we have our own
        className: "custom-popup" // Add custom class to override Leaflet styles
      })
        .setLatLng(pos)
        .setContent(popupNode)
        .openOn(map);

      popupRef.current = popup;

      // Handle popup close event - use setTimeout to avoid race conditions
      popup.on("remove", () => {
        setTimeout(() => {
          if (popupRootRef.current) {
            try {
              popupRootRef.current.unmount();
            } catch (e) {
              // Ignore unmount errors
            }
            popupRootRef.current = null;
          }
          popupRef.current = null;
          setPanelOpen(false);
          selectedContactForPanelRef.current = null;
        }, 0);
      });
    }, 0);

    // Make other markers translucent and disable clicks
    const [selectedLat, selectedLng] = pos as [number, number];
    markersRef.current.forEach((marker) => {
      const markerPos = marker.getLatLng();
      if (markerPos.lat === selectedLat && markerPos.lng === selectedLng) {
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

    // Add secondary markers for selected contact
    // selectedContact is guaranteed to exist here due to early return above
    const contact = selectedContact!;
    
    // Add visited locations (Grey)
    if (contact.visited && contact.visited.length > 0) {
      contact.visited.forEach((visitedLoc, i) => {
        const visitedLatLng: LatLngExpression = [visitedLoc.latitude, visitedLoc.longitude];
        const visitedMarker = L.marker(visitedLatLng, { icon: visitedIcon })
          .addTo(map)
          .bindPopup(`${contact.firstName} - Visited: ${visitedLoc.city || 'Location'}`);

        pastMarkersRef.current.push(visitedMarker);

        const curve = getGreatCirclePoints(
          [contact.location.latitude, contact.location.longitude],
          [visitedLoc.latitude, visitedLoc.longitude],
          50
        );

        const polyline = L.polyline(curve, {
          color: "#999",
          weight: 2,
          dashArray: "5, 5",
        }).addTo(map);

        polylinesRef.current.push(polyline);
      });
    }

    // Add past locations (Blue)
    if (contact.pastLocations && contact.pastLocations.length > 0) {
      contact.pastLocations.forEach((pastLoc, i) => {
        const pastLatLng: LatLngExpression = [pastLoc.latitude, pastLoc.longitude];
        
        const pastMarker = L.marker(pastLatLng, { icon: otherIcon })
          .addTo(map)
          .bindPopup(`${contact.firstName} - Past: ${pastLoc.city || 'Location'}`);

        pastMarkersRef.current.push(pastMarker);

        const curve = getGreatCirclePoints(
          [contact.location.latitude, contact.location.longitude],
          [pastLoc.latitude, pastLoc.longitude],
          50
        );

        const polyline = L.polyline(curve, {
          color: "#3B82F6",
          weight: 2,
          dashArray: "5, 5",
        }).addTo(map);

        polylinesRef.current.push(polyline);
      });
    }

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (popupRef.current) {
        map.closePopup();
        popupRef.current = null;
      }
      if (popupRootRef.current) {
        try {
          popupRootRef.current.unmount();
        } catch (e) {
          // Ignore unmount errors
        }
        popupRootRef.current = null;
      }
      setPanelOpen(false);
      selectedContactForPanelRef.current = null;
    };
  }, [selectedContactId, map, data]);

  return (
    <>
      <ContactDetailsPanel
        contact={selectedContactForPanelRef.current}
        open={panelOpen}
        onOpenChange={(open) => {
          setPanelOpen(open);
          if (!open) {
            selectedContactForPanelRef.current = null;
          }
        }}
      />
    </>
  );
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
      .work-marker {
        background: transparent !important;
        border: none !important;
      }
      .other-marker {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-div-icon {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-div-icon div {
        z-index: 1000 !important;
        pointer-events: auto !important;
      }
      .leaflet-tile-container img {
        filter: grayscale(100%) ${isDark ? 'invert(1)' : 'brightness(0.9)'};
      }
      /* Hide Leaflet's default popup styling - we style everything in React */
      .custom-popup {
        z-index: 10000 !important;
      }
      .custom-popup .leaflet-popup-content-wrapper {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        z-index: 10001 !important;
      }
      .custom-popup .leaflet-popup-content {
        margin: 0 !important;
        z-index: 10002 !important;
      }
      .custom-popup .leaflet-popup-tip {
        display: none !important;
      }
      .custom-popup .leaflet-popup-close-button {
        display: none !important;
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
