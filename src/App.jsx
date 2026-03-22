import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Import your data
import { mrsaData } from "./data/mrsaData";
import { medCareData } from "./data/medCareData";
import canadaGeoJSON from "./data/canada-provinces.json";

// Province metadata
const nameMap = {
  Ontario: { lookup: "Ontario", display: "ON" },
  Quebec: { lookup: "Quebec", display: "QC" },
  "British Columbia": { lookup: "British Columbia", display: "BC" },
  Alberta: { lookup: "Alberta", display: "AB" },
  Manitoba: { lookup: "Manitoba", display: "MB" },
  Saskatchewan: { lookup: "Saskatchewan", display: "SK" },
  "Nova Scotia": { lookup: "Nova Scotia", display: "NS" },
  "New Brunswick": { lookup: "New Brunswick", display: "NB" },
  "Newfoundland and Labrador": { lookup: "Newfoundland and Labrador", display: "NL" },
  "Prince Edward Island": { lookup: "Prince Edward Island", display: "PE" },
  "Northwest Territories": { lookup: "Northwest Territories", display: "NT" },
  Nunavut: { lookup: "Nunavut", display: "NU" },
  Yukon: { lookup: "Yukon", display: "YT" },
  "Yukon Territory": { lookup: "Yukon", display: "YT" },
};

// Search aliases (case-insensitive)
const searchAliasMap = {
  bc: "British Columbia",
  on: "Ontario",
  qc: "Quebec",
  ab: "Alberta",
  mb: "Manitoba",
  sk: "Saskatchewan",
  ns: "Nova Scotia",
  nb: "New Brunswick",
  nl: "Newfoundland and Labrador",
  pe: "Prince Edward Island",
  nt: "Northwest Territories",
  nu: "Nunavut",
  yt: "Yukon",
};

function resolveSearchTerm(term) {
  if (!term) return null;
  const key = term.trim().toLowerCase();
  return searchAliasMap[key] ?? term.trim();
}

function App() {
  const [searchProvince, setSearchProvince] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(null);

  // Get MRSA rate, medical care, and antibiotic amounts for a province
  const getProvinceData = (province) => {
    const normalized = resolveSearchTerm(province) ?? province;
    const lookup = nameMap[normalized]?.lookup ?? normalized;

    const mrsaEntry = mrsaData.find((d) => d.province === lookup && d.year === 2023);
    const medEntry = medCareData.find((d) => d.province === lookup && d.year === 2023);

    return {
      mrsaRate: mrsaEntry ? `${mrsaEntry.rate ?? "No data"}%` : "No data",
      medRange: medEntry ? `${medEntry.minAccess}–${medEntry.maxAccess}` : "No data",
      antibiotics: mrsaEntry
        ? `Ciprofloxacin: ${mrsaEntry.Ciprofloxacin}, Ofloxacin: ${mrsaEntry.Ofloxacin}, Vancomycin: ${mrsaEntry.Vancomycin}`
        : "No data",
    };
  };

  // GeoJSON popup for each province
  const onEachFeature = (feature, layer) => {
    const provinceName = feature.properties.name;
    const data = getProvinceData(provinceName);
    const label = data
      ? `Antibiotic Resistance Rate: ${data.mrsaRate}\nMedical Care: ${data.medRange}\nAntibiotic Supply: ${data.antibiotics}`
      : "No data";

    layer.bindPopup(label);
  };

  // Style selected province
  const styleFeature = (feature) => {
    const provinceName = feature.properties.name;
    const searchResolved = resolveSearchTerm(selectedProvince);
    const isSelected = searchResolved && provinceName.toLowerCase() === searchResolved.toLowerCase();

    return {
      fillColor: isSelected ? "orange" : "#cccccc",
      weight: isSelected ? 3 : 1,
      color: "white",
      fillOpacity: 0.7,
    };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchProvince.trim() === "") return;
    setSelectedProvince(searchProvince.trim());
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "300px", minWidth: "250px", padding: "20px", background: "#f7f7f7", boxShadow: "2px 0 5px rgba(0,0,0,0.1)", zIndex: 1000 }}>
        <h2>Search Province</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter province name or abbreviation"
            value={searchProvince}
            onChange={(e) => setSearchProvince(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <button type="submit" style={{ width: "100%", padding: "8px" }}>
            Search
          </button>
        </form>

        {selectedProvince && (
          <div style={{ marginTop: "20px" }}>
            <h3>{selectedProvince}</h3>
            <p>Antibiotic Resistance Rate: {getProvinceData(selectedProvince)?.mrsaRate}</p>
            <p>Prospective Medical Care: {getProvinceData(selectedProvince)?.medRange}</p>
            <p>Antibiotic Supply: {getProvinceData(selectedProvince)?.antibiotics}</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[56, -96]} zoom={4} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <GeoJSON
            key={selectedProvince ?? "none"}
            data={canadaGeoJSON}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
