// components/RealCSVDataMap.js - Black Background Version
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function RealCSVDataMap() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [selectedChemical, setSelectedChemical] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  
  // Real data states
  const [allHotspots, setAllHotspots] = useState([]);
  const [availableChemicals, setAvailableChemicals] = useState([]);
  const [availableSpecies, setAvailableSpecies] = useState(['all']);
  const [rawDataStats, setRawDataStats] = useState(null);

  // California county coordinates mapping
  const countyCoordinates = {
    'San Diego': [-117.1611, 32.7157],
    'Contra Costa': [-121.9496, 37.9161],
    'Riverside': [-116.2024, 33.7175],
    'Monterey': [-121.4834, 36.2333],
    'Santa Cruz': [-122.0308, 36.9741],
    'Mendocino': [-123.3525, 39.1637],
    'San Bernardino': [-116.4194, 34.7420],
    'Sonoma': [-122.7131, 38.4404],
    'Humboldt': [-124.1637, 40.7440],
    'Ventura': [-119.2290, 34.3705],
    'El Dorado': [-120.7401, 38.7501],
    'Siskiyou': [-122.6544, 41.5868],
    'Sacramento': [-121.4944, 38.5816],
    'Fresno': [-119.7871, 36.7378],
    'Los Angeles': [-118.2437, 34.0522],
    'Orange': [-117.8311, 33.7175],
    'San Francisco': [-122.4194, 37.7749],
    'Alameda': [-122.0822, 37.6017],
    'Santa Clara': [-121.9018, 37.3541],
    'Kern': [-118.5566, 35.3732],
    'Nevada': [-121.0160, 39.2616],
    'Lake': [-122.9157, 39.0840]
  };

  // Parse CSV function with better handling
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Handle CSV with potential commas in quoted fields
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };
    
    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers found:', headers);
    
    return lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line);
      const obj = {};
      headers.forEach((header, headerIndex) => {
        const value = values[headerIndex] || '';
        // Clean the value
        obj[header] = value === 'null' || value === 'NULL' || value === '' ? null : value;
      });
      return obj;
    });
  };

  // Load real ECOTOX data
  const loadRealData = async () => {
    try {
      setLoadingStatus('Loading cleaned ECOTOX datasets...');
      
      // Try to load your cleaned CSV files
      const [toxicityResponse, exposureResponse] = await Promise.all([
        fetch('/data/cleaned_toxicity_dataset.csv'),
        fetch('/data/cleaned_exposure_dataset.csv')
      ]);

      if (!toxicityResponse.ok || !exposureResponse.ok) {
        throw new Error('CSV files not found in /public/data/ folder');
      }

      const [toxicityText, exposureText] = await Promise.all([
        toxicityResponse.text(),
        exposureResponse.text()
      ]);

      setLoadingStatus('Parsing CSV data...');
      const toxicityData = parseCSV(toxicityText);
      const exposureData = parseCSV(exposureText);
      
      setLoadingStatus('Processing California data...');
      // Combine datasets
      const allData = [...toxicityData, ...exposureData];
      console.log('Total combined records:', allData.length);
      console.log('Sample record:', allData[0]);
      console.log('All column names:', Object.keys(allData[0] || {}));
      
      // Check what chemical and species data we have - be very specific about species
      const allChemicals = allData
        .map(r => r.chemical)
        .filter(c => c && c !== 'null' && c.trim() !== '' && c !== 'undefined');
      
      // Filter species to only the 5 main groups we expect
      const validSpecies = ['Amphibians', 'Fish', 'Birds', 'Mammals', 'Reptiles'];
      const allSpeciesInData = allData
        .map(r => r.species)
        .filter(s => s && s !== 'null' && s.trim() !== '' && s !== 'undefined')
        .filter(s => validSpecies.includes(s)); // Only include valid species
      
      console.log('Unique chemicals found:', [...new Set(allChemicals)]);
      console.log('Unique valid species found:', [...new Set(allSpeciesInData)]);
      console.log('All species values in data (before filtering):', [...new Set(allData.map(r => r.species).filter(s => s))]);
      console.log('Records with chemicals:', allChemicals.length);
      console.log('Records with valid species:', allSpeciesInData.length);
      
      // Sample records for each species to debug
      validSpecies.forEach(species => {
        const sampleRecord = allData.find(r => r.species === species);
        if (sampleRecord) {
          console.log(`Sample ${species} record:`, {
            chemical: sampleRecord.chemical,
            species: sampleRecord.species,
            california_counties: sampleRecord.california_counties,
            endpoint_value: sampleRecord.endpoint_value,
            endpoint_value_numeric: sampleRecord.endpoint_value_numeric
          });
        }
      });
      
      // Filter for California counties - be more inclusive
      const californiaData = allData.filter(record => {
        const hasCounty = record.california_counties && 
                         record.california_counties !== 'null' && 
                         record.california_counties.trim() !== '';
        const hasChemical = record.chemical && 
                           record.chemical !== 'null' && 
                           record.chemical.trim() !== '';
        const hasValidSpecies = record.species && validSpecies.includes(record.species);
        const hasCoordinates = hasCounty && countyCoordinates[record.california_counties.trim()];
        
        return hasCounty && hasChemical && hasValidSpecies && hasCoordinates;
      });
      
      console.log('California records after filtering:', californiaData.length);
      console.log('Sample California record:', californiaData[0]);
      
      // Debug: Check what we're filtering out
      const recordsWithCounty = allData.filter(r => r.california_counties && r.california_counties !== 'null');
      const recordsWithChemical = allData.filter(r => r.chemical && r.chemical !== 'null');
      const recordsWithValidSpecies = allData.filter(r => r.species && validSpecies.includes(r.species));
      
      console.log('Records with county:', recordsWithCounty.length);
      console.log('Records with chemical:', recordsWithChemical.length);
      console.log('Records with valid species:', recordsWithValidSpecies.length);
      console.log('Available counties:', [...new Set(recordsWithCounty.map(r => r.california_counties))]);
      
      setRawDataStats({
        totalRecords: allData.length,
        californiaRecords: californiaData.length,
        toxicityRecords: toxicityData.length,
        exposureRecords: exposureData.length,
        recordsWithCounty: recordsWithCounty.length,
        recordsWithChemical: recordsWithChemical.length,
        recordsWithValidSpecies: recordsWithValidSpecies.length
      });

      setLoadingStatus('Analyzing chemical frequencies...');
      
      // Analyze chemical frequencies from all data
      const chemicalFrequencies = {};
      allData.forEach(record => {
        const chemical = record.chemical;
        if (chemical && chemical !== 'null' && chemical.trim() !== '' && chemical !== 'undefined') {
          chemicalFrequencies[chemical] = (chemicalFrequencies[chemical] || 0) + 1;
        }
      });
      
      // Get top chemicals by frequency
      const topChemicalsByFrequency = Object.entries(chemicalFrequencies)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Get top 10 for analysis
      
      console.log('=== TOP CHEMICALS BY STUDY FREQUENCY ===');
      topChemicalsByFrequency.forEach(([chemical, count], index) => {
        console.log(`${index + 1}. ${chemical}: ${count} studies`);
      });
      
      setLoadingStatus('Creating hotspots...');
      const hotspots = processDataIntoHotspots(californiaData);
      
      setLoadingStatus('Extracting chemicals with hotspots...');
      
      // Only show chemicals that actually have hotspots created (back to original logic)
      const chemicalsWithHotspots = [...new Set(hotspots.map(h => h.chemical))].sort();
      
      // Use chemicals with hotspots, no priority by frequency for dropdown
      let finalChemicalsList = chemicalsWithHotspots;
      
      // If no hotspots from real data, fall back to a curated list of known chemicals
      if (finalChemicalsList.length === 0) {
        console.log('No hotspots generated from real data, using curated chemical list');
        finalChemicalsList = [
          'CARBARYL',
          'LEAD (elemental)',
          'ENDOSULFAN',
          'CHLORPYRIFOS',
          'MERCURY (elemental)',
          'CADMIUM (elemental)',
          'ATRAZINE',
          'COPPER (elemental)'
        ];
      }
      
      // Always include all 5 main species groups, regardless of current hotspot data
      // This ensures users can filter by any species even if current chemical doesn't have that species data
      const allMainSpecies = ['Amphibians', 'Fish', 'Birds', 'Mammals', 'Reptiles'];
      
      // Get species from hotspots for debugging
      const speciesFromHotspots = hotspots.length > 0 
        ? [...new Set(hotspots.flatMap(h => Object.keys(h.speciesData)))]
        : [];
      
      // Get species from ALL California data for debugging
      const speciesFromAllData = [...new Set(californiaData
        .map(r => r.species)
        .filter(s => s && allMainSpecies.includes(s))
      )];
      
      console.log('Top 5 most studied chemicals:', topChemicalsByFrequency.slice(0, 5));
      console.log('Chemicals with hotspots:', chemicalsWithHotspots);
      console.log('Final chemicals list (hotspots only):', finalChemicalsList);
      console.log('Species from hotspots:', speciesFromHotspots);
      console.log('Species from all CA data:', speciesFromAllData);
      console.log('Using all main species:', allMainSpecies);
      console.log('Hotspots generated:', hotspots.length);
      
      // Check mammals specifically
      const mammalsRecords = allData.filter(r => r.species === 'Mammals');
      const mammalsInCA = californiaData.filter(r => r.species === 'Mammals');
      console.log('Mammals in all data:', mammalsRecords.length);
      console.log('Mammals in CA data:', mammalsInCA.length);
      if (mammalsInCA.length > 0) {
        console.log('Sample mammals CA record:', mammalsInCA[0]);
      }
      
      setAllHotspots(hotspots);
      setAvailableChemicals(finalChemicalsList);
      setAvailableSpecies(['all', ...allMainSpecies]); // Always show all 5 species
      setSelectedChemical(finalChemicalsList[0] || '');
      
      // Store frequency data for display
      setRawDataStats({
        totalRecords: allData.length,
        californiaRecords: californiaData.length,
        toxicityRecords: toxicityData.length,
        exposureRecords: exposureData.length,
        recordsWithCounty: recordsWithCounty.length,
        recordsWithChemical: recordsWithChemical.length,
        recordsWithValidSpecies: recordsWithValidSpecies.length,
        topChemicals: topChemicalsByFrequency.slice(0, 5),
        totalUniqueChemicals: Object.keys(chemicalFrequencies).length
      });
      
      setLoadingStatus('Complete!');
      setIsDataLoaded(true);
      
      console.log('Final setup:', {
        hotspots: hotspots.length,
        chemicals: finalChemicalsList.length,
        species: allMainSpecies.length,
        californiaRecords: californiaData.length,
        topStudiedChemicals: topChemicalsByFrequency.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Error loading real data:', error);
      setLoadingStatus('Failed to load CSV files. Check if files are in /public/data/');
      
      // Don't fall back to mock data - show the error
      setTimeout(() => {
        setLoadingStatus('Place your cleaned CSV files in /public/data/ folder');
      }, 3000);
    }
  };

  // Process real data into hotspot format
  const processDataIntoHotspots = (data) => {
    console.log('Processing', data.length, 'records into hotspots');
    
    // Group by chemical and county
    const grouped = {};
    
    data.forEach((record, index) => {
      const chemical = record.chemical?.trim();
      const county = record.california_counties?.trim();
      
      if (!chemical || !county) {
        if (index < 5) console.log('Skipping record', index, '- missing chemical or county:', {chemical, county});
        return;
      }
      
      const key = `${chemical}-${county}`;
      
      if (!grouped[key]) {
        const coordinates = countyCoordinates[county];
        if (!coordinates) {
          console.log('No coordinates for county:', county);
          return;
        }
        
        grouped[key] = {
          chemical: chemical,
          location: county,
          coordinates: coordinates,
          records: [],
          speciesData: {}
        };
      }
      
      grouped[key].records.push(record);
      
      // Count species occurrences
      const species = record.species?.trim();
      if (species && species !== 'null') {
        grouped[key].speciesData[species] = 
          (grouped[key].speciesData[species] || 0) + 1;
      }
    });

    console.log('Grouped into', Object.keys(grouped).length, 'hotspots');
    console.log('Sample groups:', Object.keys(grouped).slice(0, 5));

    // Convert to hotspot format
    const hotspots = Object.entries(grouped).map(([key, groupData]) => {
      const records = groupData.records;
      
      // Extract numeric values - try multiple field names
      const numericValues = records
        .map(r => {
          // Try different numeric field names from your cleaned data
          let value = null;
          
          if (r.endpoint_value_numeric && r.endpoint_value_numeric !== 'null') {
            value = parseFloat(r.endpoint_value_numeric);
          } else if (r.endpoint_value && r.endpoint_value !== 'null') {
            const parsed = parseFloat(r.endpoint_value);
            if (!isNaN(parsed)) value = parsed;
          }
          
          // Try to extract number from text if still null
          if (value === null && typeof r.endpoint_value === 'string') {
            const match = r.endpoint_value.match(/(\d+(?:\.\d+)?)/);
            if (match) value = parseFloat(match[1]);
          }
          
          return value;
        })
        .filter(v => v !== null && !isNaN(v) && v > 0);
      
      // Calculate metrics
      const avgToxicity = numericValues.length > 0 
        ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length 
        : 0;
      
      const maxToxicity = numericValues.length > 0 
        ? Math.max(...numericValues) 
        : 0;
      
      const studyCount = records.length;
      
      // Calculate intensity (risk level) - improved algorithm
      let intensity = 0;
      if (maxToxicity > 0) {
        // Scale based on toxicity values with better scaling
        if (maxToxicity >= 1000) intensity = 90;
        else if (maxToxicity >= 100) intensity = 70;
        else if (maxToxicity >= 10) intensity = 50;
        else intensity = 30;
      }
      // Add study count factor
      intensity = Math.max(intensity, Math.min(85, studyCount * 4));
      
      // Determine risk level
      let riskLevel = 'Low';
      if (intensity >= 80) riskLevel = 'High';
      else if (intensity >= 60) riskLevel = 'Medium-High';
      else if (intensity >= 40) riskLevel = 'Medium';
      
      // Get primary unit
      const units = records
        .map(r => r.units_standardized || r.units)
        .filter(u => u && u !== 'null' && u.trim() !== '');
      const primaryUnit = units.length > 0 ? units[0] : 'units';
      
      // Get endpoint types
      const endpointTypes = [...new Set(records
        .map(r => r.endpoint_description_standardized || r.endpoint_description)
        .filter(e => e && e !== 'null' && e.trim() !== '')
      )];
      
      return {
        id: key,
        chemical: groupData.chemical,
        location: groupData.location,
        coordinates: groupData.coordinates,
        intensity: Math.round(intensity),
        toxicityValue: Math.round(avgToxicity * 100) / 100,
        maxToxicity: Math.round(maxToxicity * 100) / 100,
        unit: primaryUnit,
        studyCount: studyCount,
        riskLevel: riskLevel,
        speciesData: groupData.speciesData,
        endpointTypes: endpointTypes,
        description: `${endpointTypes.slice(0, 2).join(', ')} studies in ${groupData.location}`,
        rawRecords: records.length
      };
    });

    console.log('Created hotspots:', hotspots.length);
    console.log('Sample hotspot:', hotspots[0]);
    
    return hotspots;
  };

  // Load data on component mount
  useEffect(() => {
    loadRealData();
  }, []);

  // Filter hotspots
  const getFilteredHotspots = useCallback(() => {
    return allHotspots.filter(hotspot => {
      const matchesChemical = !selectedChemical || hotspot.chemical === selectedChemical;
      const matchesSpecies = selectedSpecies === 'all' || 
                            (hotspot.speciesData[selectedSpecies] && hotspot.speciesData[selectedSpecies] > 0);
      return matchesChemical && matchesSpecies;
    });
  }, [allHotspots, selectedChemical, selectedSpecies]);

  const getIntensityColor = (intensity) => {
    if (intensity >= 80) return '#dc2626';
    if (intensity >= 60) return '#ea580c';
    if (intensity >= 40) return '#eab308';
    return '#16a34a';
  };

  // Calculate current stats
  const filteredHotspots = getFilteredHotspots();
  const currentStats = {
    total: filteredHotspots.length,
    highRisk: filteredHotspots.filter(h => h.intensity >= 80).length,
    mediumRisk: filteredHotspots.filter(h => h.intensity >= 60 && h.intensity < 80).length,
    lowRisk: filteredHotspots.filter(h => h.intensity < 60).length,
    totalStudies: filteredHotspots.reduce((sum, h) => sum + h.studyCount, 0)
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [-119.4179, 36.7783],
      zoom: 5.5,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current.on("load", () => {
      // Hide roads
      const style = mapRef.current.getStyle();
      style.layers.forEach((layer) => {
        if (layer.id.toLowerCase().includes("road") ||
            layer["source-layer"] === "road") {
          mapRef.current.setLayoutProperty(layer.id, "visibility", "none");
        }
      });

      // Add terrain
      mapRef.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      mapRef.current.setTerrain({
        source: "mapbox-dem",
        exaggeration: 1.2,
      });

      // Load California boundary
      /*fetch("/data/california.geojson")
        .then((res) => res.json())
        .then((caGeoJson) => {
          mapRef.current.addSource("california-boundary", {
            type: "geojson",
            data: caGeoJson,
          });

          mapRef.current.addLayer({
            id: "california-outline",
            type: "line",
            source: "california-boundary",
            paint: {
              "line-color": "#000000",
              "line-width": 0.8,
            },
          });
        })
        .catch((err) => console.error("Failed to load GeoJSON:", err));*/

      // Initialize hotspot layers
      mapRef.current.addSource('hotspots', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      mapRef.current.addLayer({
        id: 'hotspot-circles',
        type: 'circle',
        source: 'hotspots',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'studyCount'],
            1, 6, 10, 12, 30, 20, 100, 30
          ],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      mapRef.current.addLayer({
        id: 'hotspot-labels',
        type: 'symbol',
        source: 'hotspots',
        layout: {
          'text-field': ['get', 'location'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-size': 11
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });

      // Click handler for popups
      mapRef.current.on('click', 'hotspot-circles', (e) => {
        const feature = e.features[0];
        const hotspot = feature.properties;
        
        const speciesData = JSON.parse(hotspot.speciesDataJson);
        const endpointTypes = JSON.parse(hotspot.endpointTypesJson);
        
        const speciesHtml = Object.entries(speciesData)
          .map(([species, count]) => `
            <div class="flex justify-between text-sm text-gray-300">
              <span>${species}:</span>
              <span class="font-medium">${count} studies</span>
            </div>
          `).join('');

        new mapboxgl.Popup({ maxWidth: '350px' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-4 bg-gray-900 text-white">
              <h3 class="font-bold text-lg text-white mb-3">
                📍 ${hotspot.location} County
              </h3>
              
              <div class="space-y-3 text-sm">
                <div class="bg-gray-800 p-2 rounded">
                  <div class="font-semibold text-gray-300">Chemical:</div>
                  <div class="text-white">${hotspot.chemical}</div>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                  <div class="bg-gray-800 p-2 rounded">
                    <div class="font-semibold text-gray-300">Avg Value:</div>
                    <div class="text-white">${hotspot.toxicityValue} ${hotspot.unit}</div>
                  </div>
                  <div class="bg-gray-800 p-2 rounded">
                    <div class="font-semibold text-gray-300">Max Value:</div>
                    <div class="text-white">${hotspot.maxToxicity} ${hotspot.unit}</div>
                  </div>
                </div>
                
                <div class="flex justify-between items-center bg-gray-800 p-2 rounded">
                  <span class="font-semibold text-gray-300">Risk Level:</span>
                  <span class="px-2 py-1 text-xs rounded-full ${
                    hotspot.riskLevel === 'High' ? 'bg-red-600 text-red-100' :
                    hotspot.riskLevel.includes('Medium') ? 'bg-yellow-600 text-yellow-100' :
                    'bg-green-600 text-green-100'
                  }">${hotspot.riskLevel}</span>
                </div>
                
                <div class="bg-gray-800 p-2 rounded">
                  <div class="font-semibold text-gray-300 mb-1">Studies: ${hotspot.studyCount}</div>
                  <div class="font-semibold text-gray-300 mb-1">Records: ${hotspot.rawRecords}</div>
                </div>
                
                <div class="bg-gray-800 p-2 rounded">
                  <div class="font-semibold text-gray-300 mb-2">Species Affected:</div>
                  <div class="space-y-1">${speciesHtml}</div>
                </div>
                
                <div class="bg-gray-800 p-2 rounded">
                  <div class="font-semibold text-gray-300 mb-1">Endpoint Types:</div>
                  <div class="text-gray-400 text-xs">${endpointTypes.slice(0, 3).join(', ')}</div>
                </div>
              </div>
            </div>
          `)
          .addTo(mapRef.current);
      });

      mapRef.current.on('mouseenter', 'hotspot-circles', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });

      mapRef.current.on('mouseleave', 'hotspot-circles', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });

      setIsMapLoaded(true);
    });
  }, []);

  // Update hotspots when data or filters change
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current.getSource('hotspots') || !isDataLoaded) return;

    const features = filteredHotspots.map(hotspot => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: hotspot.coordinates
      },
      properties: {
        ...hotspot,
        color: getIntensityColor(hotspot.intensity),
        speciesDataJson: JSON.stringify(hotspot.speciesData),
        endpointTypesJson: JSON.stringify(hotspot.endpointTypes)
      }
    }));

    mapRef.current.getSource('hotspots').setData({
      type: 'FeatureCollection',
      features
    });
  }, [selectedChemical, selectedSpecies, isMapLoaded, isDataLoaded, filteredHotspots]);

  return (
    <div className="relative bg-black">
      {/* Data Source Info */}
      {rawDataStats && (
        <div className="absolute top-4 right-4 z-10 bg-gray-900 border border-green-500 rounded-lg p-3 max-w-xs">
          <h4 className="text-sm font-semibold text-green-400 mb-2">📊 Real Data Loaded</h4>
          <div className="text-xs text-green-300 space-y-1">
            <div>Total Records: {rawDataStats.totalRecords.toLocaleString()}</div>
            <div>California: {rawDataStats.californiaRecords}</div>
            <div>Toxicity: {rawDataStats.toxicityRecords}</div>
            <div>Exposure: {rawDataStats.exposureRecords}</div>
            <div>Hotspots: {allHotspots.length}</div>
          </div>
        </div>
      )}

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-900 border border-gray-600 rounded-lg shadow-xl p-4 max-w-sm">
        <h3 className="font-bold text-lg mb-3 text-white">
          🧪 Real ECOTOX Data Explorer
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Chemical Compound ({availableChemicals.length} with hotspots)
            </label>
            <select
              value={selectedChemical}
              onChange={(e) => setSelectedChemical(e.target.value)}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!isDataLoaded}
            >
              {availableChemicals.length === 0 ? (
                <option value="">No chemicals with hotspot data found</option>
              ) : (
                <>
                  <option value="">Select a chemical...</option>
                  {availableChemicals.map(chemical => (
                    <option key={chemical} value={chemical} className="bg-gray-800 text-white">
                      {chemical}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Species Filter (5 species groups)
            </label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="w-full border border-gray-600 bg-gray-800 text-white rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!isDataLoaded}
            >
              {availableSpecies.map(species => (
                <option key={species} value={species} className="bg-gray-800 text-white">
                  {species === 'all' ? 'All Species' : species}
                </option>
              ))}
            </select>
          </div>

          {/* Current Selection Stats */}
          {isDataLoaded && (
            <div className="bg-gray-800 border border-blue-500 rounded-md p-3">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">Current Selection</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-blue-300">
                  Hotspots: <span className="font-bold text-white">{currentStats.total}</span>
                </div>
                <div className="text-blue-300">
                  Studies: <span className="font-bold text-white">{currentStats.totalStudies}</span>
                </div>
                <div className="text-red-400">
                  High Risk: <span className="font-bold">{currentStats.highRisk}</span>
                </div>
                <div className="text-yellow-400">
                  Medium+: <span className="font-bold">{currentStats.mediumRisk}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Risk Levels</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span className="text-sm font-medium text-gray-300">High Risk (80%+)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-orange-600"></div>
              <span className="text-sm font-medium text-gray-300">Medium-High (60-79%)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
              <span className="text-sm font-medium text-gray-300">Medium (40-59%)</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span className="text-sm font-medium text-gray-300">Low Risk (40%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[800px] rounded-lg shadow-lg mb-8" />

      

      {/* Loading Overlay */}
      {!isDataLoaded && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg z-20">
          <div className="bg-gray-900 border border-gray-600 p-6 rounded-lg text-center max-w-md">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-sm font-medium text-white mb-2">{loadingStatus}</p>
            <p className="text-xs text-gray-400">
              Loading your cleaned ECOTOX CSV files...
            </p>
            {loadingStatus.includes('Failed') && (
              <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded text-left">
                <p className="text-xs text-red-300 font-medium mb-2">Required Files:</p>
                <ul className="text-xs text-red-400 space-y-1">
                  <li>• /public/data/cleaned_toxicity_dataset.csv</li>
                  <li>• /public/data/cleaned_exposure_dataset.csv</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}