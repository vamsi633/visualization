// utils/hotspotDataLoader.js

// California county coordinates for mapping
const COUNTY_COORDINATES = {
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
  'Kern': [-118.5566, 35.3732]
};

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || null;
      });
      return obj;
    });
}

/**
 * Load and process ECOTOX data from CSV files
 */
export async function loadEcotoxData() {
  try {
    // Load the cleaned datasets
    const [toxicityResponse, exposureResponse] = await Promise.all([
      fetch('/data/cleaned_toxicity_dataset.csv'),
      fetch('/data/cleaned_exposure_dataset.csv')
    ]);

    if (!toxicityResponse.ok || !exposureResponse.ok) {
      throw new Error('Failed to load CSV files');
    }

    const [toxicityText, exposureText] = await Promise.all([
      toxicityResponse.text(),
      exposureResponse.text()
    ]);

    const toxicityData = parseCSV(toxicityText);
    const exposureData = parseCSV(exposureText);

    // Combine datasets
    const combinedData = [...toxicityData, ...exposureData];

    // Filter for records with California location data
    const californiaData = combinedData.filter(record => 
      record.california_counties && 
      record.chemical &&
      record.endpoint_value_numeric &&
      COUNTY_COORDINATES[record.california_counties]
    );

    return californiaData;
  } catch (error) {
    console.error('Error loading ECOTOX data:', error);
    return [];
  }
}

/**
 * Process raw ECOTOX data into hotspot format
 */
export function processIntoHotspots(ecotoxData) {
  // Group by chemical and location
  const grouped = {};
  
  ecotoxData.forEach(record => {
    const key = `${record.chemical}-${record.california_counties}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        chemical: record.chemical,
        location: record.california_counties,
        coordinates: COUNTY_COORDINATES[record.california_counties],
        records: [],
        speciesData: {}
      };
    }
    
    grouped[key].records.push(record);
    
    // Count species
    if (record.species) {
      grouped[key].speciesData[record.species] = 
        (grouped[key].speciesData[record.species] || 0) + 1;
    }
  });

  // Convert to hotspot format
  return Object.entries(grouped).map(([key, data]) => {
    const records = data.records;
    const numericValues = records
      .map(r => parseFloat(r.endpoint_value_numeric))
      .filter(v => !isNaN(v));
    
    // Calculate aggregate metrics
    const avgToxicity = numericValues.length > 0 
      ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length 
      : 0;
    
    const maxToxicity = numericValues.length > 0 
      ? Math.max(...numericValues) 
      : 0;
    
    // Determine intensity based on toxicity values and study count
    const studyCount = records.length;
    const intensityFromToxicity = Math.min(100, (maxToxicity / 1000) * 100);
    const intensityFromStudies = Math.min(50, studyCount * 2);
    const intensity = Math.max(intensityFromToxicity, intensityFromStudies);
    
    // Determine risk level
    let riskLevel = 'Low';
    if (intensity >= 80) riskLevel = 'High';
    else if (intensity >= 60) riskLevel = 'Medium-High';
    else if (intensity >= 40) riskLevel = 'Medium';
    
    // Get primary unit
    const units = records.map(r => r.units_standardized).filter(u => u);
    const primaryUnit = units.length > 0 ? units[0] : 'μg/L';
    
    // Create description
    const endpointTypes = [...new Set(records.map(r => r.endpoint_description_standardized).filter(e => e))];
    const description = `${endpointTypes.slice(0, 2).join(', ')} studies in ${data.location} County`;

    return {
      id: key,
      chemical: data.chemical,
      location: data.location,
      coordinates: data.coordinates,
      intensity: Math.round(intensity),
      toxicityValue: Math.round(avgToxicity * 100) / 100,
      maxToxicity: Math.round(maxToxicity * 100) / 100,
      unit: primaryUnit,
      studyCount: studyCount,
      riskLevel: riskLevel,
      speciesData: data.speciesData,
      description: description,
      endpointTypes: endpointTypes,
      rawRecords: records
    };
  });
}

/**
 * Get unique chemicals from hotspot data
 */
export function getUniqueChemicals(hotspots) {
  return [...new Set(hotspots.map(h => h.chemical))].sort();
}

/**
 * Get unique species from hotspot data
 */
export function getUniqueSpecies(hotspots) {
  const allSpecies = new Set();
  hotspots.forEach(hotspot => {
    Object.keys(hotspot.speciesData).forEach(species => {
      allSpecies.add(species);
    });
  });
  return ['all', ...Array.from(allSpecies).sort()];
}

/**
 * Filter hotspots by chemical and species
 */
export function filterHotspots(hotspots, chemical, species) {
  return hotspots.filter(hotspot => {
    const matchesChemical = !chemical || chemical === 'all' || hotspot.chemical === chemical;
    const matchesSpecies = !species || species === 'all' || 
                          (hotspot.speciesData[species] && hotspot.speciesData[species] > 0);
    return matchesChemical && matchesSpecies;
  });
}

/**
 * Calculate summary statistics for hotspots
 */
export function calculateHotspotStats(hotspots) {
  const total = hotspots.length;
  const highRisk = hotspots.filter(h => h.intensity >= 80).length;
  const mediumRisk = hotspots.filter(h => h.intensity >= 60 && h.intensity < 80).length;
  const lowRisk = hotspots.filter(h => h.intensity < 60).length;
  const totalStudies = hotspots.reduce((sum, h) => sum + h.studyCount, 0);
  
  return {
    total,
    highRisk,
    mediumRisk,
    lowRisk,
    totalStudies
  };
}