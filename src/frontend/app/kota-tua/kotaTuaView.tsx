"use client";
import {
  Cartesian3,
  Cesium3DTileset as CesiumNative3DTileset,
  Viewer as NativeCesiumViewer,
  Color,
  CesiumTerrainProvider,
  Cesium3DTileStyle,
  SplitDirection,
  UrlTemplateImageryProvider,
  LabelStyle,
  VerticalOrigin,
  HorizontalOrigin,
  Cartesian2,
  NearFarScalar,
} from "cesium";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import {
  CameraFlyTo,
  CesiumComponentRef,
  Viewer,
  Cesium3DTileset,
  ImageryLayer,
  Entity,
} from "resium";
import {
  Card,
  CardBody,
  CardHeader,
  Slider,
  Button,
  Divider,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  DEFAULT_CAMERA_DESTINATION,
  DEFAULT_CAMERA_ORIENTATION,
  IMAGERY_CONFIG,
  BASEMAP_OPTIONS,
} from "./kotaTua.constant";

interface GeoJSONProperties {
  id?: string;
  no: number;
  lokasi: string;
  waktu: string;
  pemeran: string;
  adegan: number;
  periode: string;
}

interface GeoJSONFeature {
  type: string;
  properties: GeoJSONProperties;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

const TILESETS: Record<string, string> = {
  "1619":
    "https://bucket.dt-jakarta.geo-ai.id/model3d/kota-tua/1619/tileset.json",
  "1627":
    "https://bucket.dt-jakarta.geo-ai.id/model3d/kota-tua/1627/tileset.json",
  "1635":
    "https://bucket.dt-jakarta.geo-ai.id/model3d/kota-tua/1635/tileset.json",
  "1650":
    "https://bucket.dt-jakarta.geo-ai.id/model3d/kota-tua/1650/tileset.json",
  "2023":
    "https://digital-twin-ugm.s3.ap-southeast-1.amazonaws.com/assets/2023/tileset.json",

};

export default function KotaTuaView() {
  const cesiumRef = useRef<CesiumComponentRef<NativeCesiumViewer>>(null);
  // const [referenceCenter, setReferenceCenter] = useState<Cartesian3 | null>(
  //   null
  // );
  const [leftEpoch, setLeftEpoch] = useState("1627");
  const [rightEpoch, setRightEpoch] = useState("2023");
  const [splitPosition, setSplitPosition] = useState(0.5);

  // Independent controls
  const [leftBasemap, setLeftBasemap] = useState("default");
  const [rightBasemap, setRightBasemap] = useState("default");
  const [showLeftOverlay, setShowLeftOverlay] = useState(false);
  const [showRightOverlay, setShowRightOverlay] = useState(false);
  const [leftOverlayOpacity, setLeftOverlayOpacity] = useState(0.7);
  const [rightOverlayOpacity, setRightOverlayOpacity] = useState(0.7);

  const [showToponimi, setShowToponimi] = useState(true);
  const [toponymFeatures, setToponymFeatures] = useState<GeoJSONFeature[]>([]);

  useEffect(() => {
    fetch("/toponimi.geojson")
      .then((res) => res.json())
      .then((data) => setToponymFeatures(data.features))
      .catch((err) => console.error("Failed to load toponimi:", err));
  }, []);

  // Reset basemaps/overlays when epoch changes?
  // User didn't explicitly ask, but usually we want to keep selection or reset.
  // For now, let's reset to "default" when epoch changes to ensure they see the correct historical context first.
  useEffect(() => {
    setLeftBasemap("default");
    setShowLeftOverlay(false);
  }, [leftEpoch]);

  useEffect(() => {
    setRightBasemap("default");
    setShowRightOverlay(false);
  }, [rightEpoch]);

  // Sync split position with Cesium scene
  useEffect(() => {
    if (cesiumRef.current?.cesiumElement) {
      cesiumRef.current.cesiumElement.scene.splitPosition = splitPosition;
    }
  }, [splitPosition]);
  const setTerrain = useCallback(async () => {
    if (cesiumRef.current?.cesiumElement) {
      try {
        const terrainProvider = await CesiumTerrainProvider.fromUrl(
          "https://digital-twin-ugm.s3.ap-southeast-1.amazonaws.com/terrain/dtm6/"
        );
        cesiumRef.current.cesiumElement.terrainProvider = terrainProvider;
        cesiumRef.current.cesiumElement.scene.globe.depthTestAgainstTerrain =
          true;
      } catch (error) {
        console.error("Error loading terrain:", error);
      }
    }
  }, []);

  const handleCameraFlyComplete = useCallback(() => {
    setTerrain();
    if (cesiumRef.current?.cesiumElement) {
      cesiumRef.current.cesiumElement.scene.splitPosition = splitPosition;
    }
  }, [setTerrain, splitPosition]);
  // Handler saat tileset ready
  // Handler saat tileset ready
  const handleTilesetReady = useCallback(
    (tileset: CesiumNative3DTileset, epoch: string, isLeft: boolean) => {
      console.log(`✅ Tileset ${epoch} (${isLeft ? "LEFT" : "RIGHT"}) loaded`);

      // DISABLE MANUAL ALIGNMENT - This was causing "flying" buildings because bounding spheres differ between epochs
      // tileset.modelMatrix = Matrix4.IDENTITY;

      tileset.style = new Cesium3DTileStyle({
        color: "color('#90A4AE')", // Abu-abu medium
      });

      // Apply visual settings directly
      tileset.splitDirection = isLeft
        ? SplitDirection.LEFT
        : SplitDirection.RIGHT;
    },
    []
  );

  // Memoize providers
  const leftProvider = useMemo(() => {
    const isDefault = leftBasemap === "default";
    const url = isDefault
      ? IMAGERY_CONFIG[leftEpoch]?.url || "https://tile.openstreetmap.de/{z}/{x}/{y}.png"
      : leftBasemap;
    const options = isDefault ? IMAGERY_CONFIG[leftEpoch]?.options : {};

    return new UrlTemplateImageryProvider({ url, ...options });
  }, [leftEpoch, leftBasemap]);

  const rightProvider = useMemo(() => {
    const isDefault = rightBasemap === "default";
    const url = isDefault
      ? IMAGERY_CONFIG[rightEpoch]?.url || "https://tile.openstreetmap.de/{z}/{x}/{y}.png"
      : rightBasemap;
    const options = isDefault ? IMAGERY_CONFIG[rightEpoch]?.options : {};

    return new UrlTemplateImageryProvider({ url, ...options });
  }, [rightEpoch, rightBasemap]);

  // Overlay Providers
  const leftOverlayProvider = useMemo(() => {
    const url = IMAGERY_CONFIG[leftEpoch]?.overlayUrl;
    return url ? new UrlTemplateImageryProvider({ url }) : null;
  }, [leftEpoch]);

  const rightOverlayProvider = useMemo(() => {
    const url = IMAGERY_CONFIG[rightEpoch]?.overlayUrl;
    return url ? new UrlTemplateImageryProvider({ url }) : null;
  }, [rightEpoch]);

  return (
    <>
      <Viewer
        shouldAnimate
        ref={cesiumRef}
        infoBox={false}
        baseLayerPicker={false}
        style={{ height: "100%" }}
        timeline={false}
        animation={false}
      >
        <CameraFlyTo
          destination={DEFAULT_CAMERA_DESTINATION}
          duration={0}
          orientation={DEFAULT_CAMERA_ORIENTATION}
          once
          onComplete={handleCameraFlyComplete}
        />

        {/* Left Imagery */}
        <ImageryLayer
          key={`left-base-${leftEpoch}-${leftBasemap}`}
          imageryProvider={leftProvider}
          splitDirection={SplitDirection.LEFT}
          show={true}
        />

        <ImageryLayer
          key={`right-base-${rightEpoch}-${rightBasemap}`}
          imageryProvider={rightProvider}
          splitDirection={SplitDirection.RIGHT}
          show={true}
        />

        {/* Left Overlay (Optional) */}
        {leftOverlayProvider && (
          <ImageryLayer
            key={`left-overlay-${leftEpoch}-${leftBasemap}`}
            imageryProvider={leftOverlayProvider}
            splitDirection={SplitDirection.LEFT}
            show={showLeftOverlay}
            alpha={leftOverlayOpacity}
          />
        )}

        {/* Right Overlay (Optional) */}
        {rightOverlayProvider && (
          <ImageryLayer
            key={`right-overlay-${rightEpoch}-${rightBasemap}`}
            imageryProvider={rightOverlayProvider}
            splitDirection={SplitDirection.RIGHT}
            show={showRightOverlay}
            alpha={rightOverlayOpacity}
          />
        )}

        {/* Toponimi markers */}
        {showToponimi &&
          toponymFeatures.map((feature) => {
            const [lon, lat] = feature.geometry.coordinates;
            const props = feature.properties;
            const isBelanda = props.pemeran === "Belanda";
            const pinColor = isBelanda
              ? Color.fromCssColorString("#4F8EF7")
              : Color.fromCssColorString("#F5A623");
            return (
              <Entity
                key={feature.properties.id ?? `${lon}-${lat}-${props.no}`}
                position={Cartesian3.fromDegrees(lon, lat, 5)}
                point={{
                  pixelSize: 10,
                  color: pinColor,
                  outlineColor: Color.WHITE,
                  outlineWidth: 2,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  scaleByDistance: new NearFarScalar(100, 1.4, 3000, 0.6),
                }}
                label={{
                  text: `${props.no}. ${props.lokasi}`,
                  font: "bold 16px sans-serif",
                  fillColor: Color.WHITE,
                  outlineColor: Color.BLACK,
                  outlineWidth: 2,
                  style: LabelStyle.FILL_AND_OUTLINE,
                  verticalOrigin: VerticalOrigin.BOTTOM,
                  horizontalOrigin: HorizontalOrigin.LEFT,
                  pixelOffset: new Cartesian2(8, -12),
                  scaleByDistance: new NearFarScalar(100, 1.0, 2000, 0.4),
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  showBackground: true,
                  backgroundColor: isBelanda
                    ? Color.fromCssColorString("#1a3a6e").withAlpha(0.75)
                    : Color.fromCssColorString("#7a4400").withAlpha(0.75),
                  backgroundPadding: new Cartesian2(5, 3),
                }}
                description={`
                  <b>No:</b> ${props.no}<br/>
                  <b>Lokasi:</b> ${props.lokasi}<br/>
                  <b>Waktu:</b> ${props.waktu}<br/>
                  <b>Pemeran:</b> ${props.pemeran}<br/>
                  <b>Adegan:</b> ${props.adegan}
                ` as unknown as any}
              />
            );
          })}

        {/* Load all tilesets (left side) */}
        {Object.entries(TILESETS).map(([epoch, url]) => (
          <Cesium3DTileset
            key={`left-${epoch}`}
            url={url}
            show={epoch === leftEpoch}
            onReady={(tileset) => handleTilesetReady(tileset, epoch, true)}
          />
        ))}

        {/* Load all tilesets (right side) */}
        {Object.entries(TILESETS).map(([epoch, url]) => (
          <Cesium3DTileset
            key={`right-${epoch}`}
            url={url}
            show={epoch === rightEpoch}
            onReady={(tileset) => handleTilesetReady(tileset, epoch, false)}
          />
        ))}
      </Viewer>

      {/* Control Panel */}
      <div className="absolute top-4 left-4 pointer-events-none z-50">
        <Card className="w-[300px] bg-white/40 backdrop-blur-xl border border-white/20 shadow-2xl pointer-events-auto rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-indigo-500/90 backdrop-blur-md p-4">
            <div className="flex items-center gap-3 w-full">
              <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-2xl">🕰️</span>
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-base font-semibold text-white">
                  Epoch Comparison
                </p>
                <p className="text-xs text-white/70">Split-Screen Viewer</p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="gap-4 p-4">
            {/* Epoch Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Side */}
              <div className="space-y-3 p-2 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <p className="text-xs font-medium text-black/90">
                    Left Settings
                  </p>
                </div>

                {/* Epoch */}
                <Select
                  label="Epoch"
                  size="sm"
                  selectedKeys={[leftEpoch]}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLeftEpoch(e.target.value)}
                  classNames={{
                    label: "text-black/60",
                    value: "text-black/90",
                  }}
                >
                  {Object.keys(TILESETS).map((epoch) => (
                    <SelectItem key={epoch} value={epoch}>
                      {epoch}
                    </SelectItem>
                  ))}
                </Select>

                {/* Basemap */}
                <Select
                  label="Basemap"
                  size="sm"
                  selectedKeys={[leftBasemap]}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLeftBasemap(e.target.value)}
                  classNames={{
                    label: "text-black/60",
                    value: "text-black/90",
                  }}
                >
                  {BASEMAP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Overlay Toggle + Opacity */}
                {IMAGERY_CONFIG[leftEpoch]?.overlayUrl && (
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onPress={() => setShowLeftOverlay(!showLeftOverlay)}
                      className={`w-full text-xs ${showLeftOverlay
                        ? "bg-indigo-500 text-white"
                        : "bg-white/20 text-black border border-black/10"
                        }`}
                    >
                      {showLeftOverlay ? "Overlay Visible" : "Show Overlay"}
                    </Button>
                    {showLeftOverlay && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-black/60">Opacity</p>
                          <span className="text-xs font-semibold text-indigo-600">
                            {Math.round(leftOverlayOpacity * 100)}%
                          </span>
                        </div>
                        <Slider
                          size="sm"
                          step={0.01}
                          minValue={0}
                          maxValue={1}
                          value={leftOverlayOpacity}
                          onChange={(val: number | number[]) =>
                            setLeftOverlayOpacity(Array.isArray(val) ? val[0] : val)
                          }
                          classNames={{
                            track: "bg-white/20",
                            filler: "bg-indigo-400",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div className="space-y-3 p-2 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                  <p className="text-xs font-medium text-black/90">
                    Right Settings
                  </p>
                </div>

                {/* Epoch */}
                <Select
                  label="Epoch"
                  size="sm"
                  selectedKeys={[rightEpoch]}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRightEpoch(e.target.value)}
                  classNames={{
                    label: "text-black/60",
                    value: "text-black/90",
                  }}
                >
                  {Object.keys(TILESETS).map((epoch) => (
                    <SelectItem key={epoch} value={epoch}>
                      {epoch}
                    </SelectItem>
                  ))}
                </Select>

                {/* Basemap */}
                <Select
                  label="Basemap"
                  size="sm"
                  selectedKeys={[rightBasemap]}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRightBasemap(e.target.value)}
                  classNames={{
                    label: "text-black/60",
                    value: "text-black/90",
                  }}
                >
                  {BASEMAP_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Overlay Toggle + Opacity */}
                {IMAGERY_CONFIG[rightEpoch]?.overlayUrl && (
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onPress={() => setShowRightOverlay(!showRightOverlay)}
                      className={`w-full text-xs ${showRightOverlay
                        ? "bg-indigo-400 text-white"
                        : "bg-white/20 text-black border border-black/10"
                        }`}
                    >
                      {showRightOverlay ? "Overlay Visible" : "Show Overlay"}
                    </Button>
                    {showRightOverlay && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-black/60">Opacity</p>
                          <span className="text-xs font-semibold text-indigo-400">
                            {Math.round(rightOverlayOpacity * 100)}%
                          </span>
                        </div>
                        <Slider
                          size="sm"
                          step={0.01}
                          minValue={0}
                          maxValue={1}
                          value={rightOverlayOpacity}
                          onChange={(val: number | number[]) =>
                            setRightOverlayOpacity(Array.isArray(val) ? val[0] : val)
                          }
                          classNames={{
                            track: "bg-white/20",
                            filler: "bg-indigo-300",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Divider className="bg-white/10" />

            {/* Toponimi Toggle */}
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-black/90">Toponimi 1628</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4F8EF7] inline-block" title="Belanda" />
                  <span className="text-xs text-black/50">Belanda</span>
                  <span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block ml-1" title="Pribumi" />
                  <span className="text-xs text-black/50">Pribumi</span>
                </div>
              </div>
              <Button
                size="sm"
                onPress={() => setShowToponimi(!showToponimi)}
                className={`w-full text-xs ${
                  showToponimi
                    ? "bg-indigo-500 text-white"
                    : "bg-white/20 text-black border border-black/10"
                }`}
              >
                {showToponimi ? "Toponyms Visible" : "Show Toponyms"}
              </Button>
            </div>

            <Divider className="bg-white/10" />

            {/* Split Position */}
            <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-black/90">
                  Split Position
                </p>
                <div className="bg-indigo-500/30 px-2 py-0.5 rounded-md">
                  <p className="text-xs font-semibold text-white">
                    {(splitPosition * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <Slider
                size="sm"
                step={0.01}
                minValue={0.0}
                maxValue={1.0}
                value={splitPosition}
                onChange={(val: number | number[]) =>
                  setSplitPosition(Array.isArray(val) ? val[0] : val)
                }
                classNames={{
                  track: "bg-white/20",
                  filler: "bg-indigo-500",
                }}
              />
            </div>

            <Divider className="bg-white/10" />

            {/* Info Box */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                  <span className="text-xs text-black/90">{leftEpoch}</span>
                </div>

                <span className="text-white/50 text-xs">vs</span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-black/90">{rightEpoch}</span>
                  <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
