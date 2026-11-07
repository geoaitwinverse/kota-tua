"use client";
import { Cartesian3, Math as CesiumMath, Ion } from "cesium";

// Set default Cesium Ion access token
Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ACCESS_TOKEN as string;

const STADIA_API_KEY = process.env.NEXT_PUBLIC_STADIA_API_KEY || "";

// Storage hosts for map tiles, 3D tilesets and terrain (no trailing slash)
export const BUCKET_URL = process.env.NEXT_PUBLIC_BUCKET_URL || "";
export const S3_URL = process.env.NEXT_PUBLIC_S3_URL || "";
const stadiaUrl = (style: string, ext = "jpg") =>
  `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}.${ext}?api_key=${STADIA_API_KEY}`;

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
    overlayUrl: `${BUCKET_URL}/kota-tua/maps/1619/{z}/{x}/{y}.png`,
  },
  "1627": {
    url: stadiaUrl("stamen_watercolor"),
    overlayUrl: `${BUCKET_URL}/kota-tua/maps/1627/{z}/{x}/{y}.png`,
  },
  "1635": {
    url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
    overlayUrl: `${BUCKET_URL}/kota-tua/maps/1635/{z}/{x}/{y}.png`,
  },
  "1650": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    overlayUrl: `${BUCKET_URL}/kota-tua/maps/1650/{z}/{x}/{y}.png`,
  },
  "2023": {
    url: stadiaUrl("alidade_smooth", "png"),
  },
  "2024": {
    url: stadiaUrl("alidade_smooth", "png"),
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
    value: stadiaUrl("alidade_smooth", "png"),
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
