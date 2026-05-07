import { Cartesian3, Math as CesiumMath, Ion } from "cesium";

// Set default Cesium Ion access token
Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN as string;

const STADIA_API_KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY || "";
const stadiaUrl = (style: string) =>
  `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}.jpg?api_key=${STADIA_API_KEY}`;

// TomTom traffic imagery provider
// Basemap URLs
// Basemap Configuration
interface ImageryConfig {
  url: string;
  overlayUrl?: string; // Optional overlay layer (e.g., custom tiles from AWS)
  options?: any; // UrlTemplateImageryProvider.ConstructorOptions
}

export const IMAGERY_CONFIG: Record<string, ImageryConfig> = {
  "1619": {
    url: stadiaUrl("stamen_terrain_background"),
    overlayUrl:
      "https://digital-twin-ugm.s3.ap-southeast-1.amazonaws.com/kota-tua/basemap/1619/{z}/{x}/{reverseY}.png",
  },
  "1627": {
    url: stadiaUrl("stamen_watercolor"),
    overlayUrl:
      "https://digital-twin-ugm.s3.ap-southeast-1.amazonaws.com/kota-tua/basemap/1627/{z}/{x}/{reverseY}.png",
  },
  "1650": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    overlayUrl:
      "https://digital-twin-ugm.s3.ap-southeast-1.amazonaws.com/kota-tua/basemap/1650/{z}/{x}/{reverseY}.png",
  },
  "2023": {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    options: { subdomains: ["a", "b", "c", "d"] },
  },
  "2024": {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    options: { subdomains: ["a", "b", "c", "d"] },
  },
};

export const BASEMAP_OPTIONS = [
  { label: "Default (Epoch)", value: "default" },
  {
    label: "Stamen Watercolor",
    value: stadiaUrl("stamen_watercolor"),
  },
  {
    label: "Stamen Terrain",
    value: stadiaUrl("stamen_terrain_background"),
  },
  {
    label: "Esri World Street",
    value:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  },
  {
    label: "Free Map",
    value: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  },
  {
    label: "OpenStreetMap",
    value: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
  },
];

// Default camera position and orientation
export const DEFAULT_CAMERA_DESTINATION = Cartesian3.fromDegrees(
  // longitude
  // latitude

  106.81200285308154,
  -6.148407963613765,
  250 // height (meter)
);
export const DEFAULT_CAMERA_ORIENTATION = {
  heading: CesiumMath.toRadians(0), // Rotasi horizontal (0 = utara, 90 = timur, 180 = selatan, 270 = barat)
  pitch: CesiumMath.toRadians(-18), // Miring ke bawah (-90 = lurus ke bawah, 0 = sejajar dengan tanah)
  roll: 0.0,
};

// Building label configuration
export const BUILDING_LABEL_CONFIG = {
  heightOffset: 20, // Height above the building in meters
  font: "16pt sans-serif",
  pixelOffsetY: -50,
};
