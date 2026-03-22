import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Example MRSA data
const mrsaData = [
  { province: "British Columbia", year: 2020, MRSA_rate: 5.2 },
  { province: "British Columbia", year: 2021, MRSA_rate: 5.8 },
  { province: "British Columbia", year: 2022, MRSA_rate: 4.9 },
  { province: "Alberta", year: 2020, MRSA_rate: 6.3 },
  { province: "Alberta", year: 2021, MRSA_rate: 7.0 },
  { province: "Alberta", year: 2022, MRSA_rate: 6.1 },
  { province: "Ontario", year: 2020, MRSA_rate: 10.1 },
  { province: "Ontario", year: 2021, MRSA_rate: 11.2 },
  { province: "Ontario", year: 2022, MRSA_rate: 9.8 },
  { province: "Quebec", year: 2020, MRSA_rate: 8.5 },
  { province: "Quebec", year: 2021, MRSA_rate: 9.0 },
  { province: "Quebec", year: 2022, MRSA_rate: 7.9 },
  { province: "Manitoba", year: 2020, MRSA_rate: 9.1 },
  { province: "Manitoba", year: 2021, MRSA_rate: 9.3 },
  { province: "Manitoba", year: 2022, MRSA_rate: 7.8 },
  { province: "Saskatchewan", year: 2020, MRSA_rate: 20.5 },
  { province: "Saskatchewan", year: 2021, MRSA_rate: 18.7 },
  { province: "Saskatchewan", year: 2022, MRSA_rate: 21.0 },
];

export default function App() {
  const [year, setYear] = useState(2022);
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch("/data/canada-provinces.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data));
  }, []);

  const styleFeature = (feature) => {
    const rawName = feature.properties.name === "Québec" ? "Quebec" : feature.properties.name;
    const dataForProvince = mrsaData.find((d) => d.province === rawName && d.year === year);
    const rate = dataForProvince ? dataForProvince.MRSA_rate : null;

    return {
      fillColor:
        rate === null ? "#cccccc" :
        rate > 15 ? "#800026" :
        rate > 10 ? "#BD0026" :
        rate > 5  ? "#E31A1C" :
                     "#FC4E2A",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature, layer) => {
    const rawName = feature.properties.name === "Québec" ? "Quebec" : feature.properties.name;
    const dataForProvince = mrsaData.find((d) => d.province === rawName && d.year === year);
    const rate = dataForProvince ? dataForProvince.MRSA_rate : "No data";
    layer.bindPopup(`${feature.properties.name}: ${rate}`);
  };

  if (!geoData) return <p>Loading map...</p>;

  return (
    <div>
      <h2>Canada MRSA Rates {year}</h2>
      <input
        type="range"
        min="2020"
        max="2022"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      />
      <MapContainer center={[56, -96]} zoom={4} style={{ height: "80vh" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={year}
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}
