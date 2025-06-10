// Browser-compatible version of data.js
// Removed fs, path imports and replaced with fetch-based loading

// Helper function for string normalization
function normalizeString(value) {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  return String(value).trim().toLowerCase(); // Convert non-strings to string then normalize
}

// Simple CSV parser (browser-compatible alternative to csv-parse/sync)
function parseCSV(csvText) {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ""));
    return result;
  };

  const headers = parseCSVLine(lines[0]);

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);
      const obj = {};
      headers.forEach((header, index) => {
        const value = values[index] || "";
        obj[header] =
          value === "null" || value === "NULL" || value === "" ? null : value;
      });
      return obj;
    })
    .filter((row) =>
      Object.keys(row).some((key) => row[key] !== null && row[key] !== "")
    );
}

export async function getChartData() {
  try {
    // Use fetch to load CSV file from public directory
    const response = await fetch("data/aaaaaaa_duration_filled_NR.csv");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch CSV file: ${response.status} ${response.statusText}`
      );
    }

    const fileContent = await response.text();

    // Parse CSV content
    const records = parseCSV(fileContent);

    if (records.length === 0) {
      console.warn("No records found in CSV file");
      return getEmptyChartData();
    }

    // Apply normalization to relevant columns
    const normalizedRecords = records.map((row) => ({
      Chemical: normalizeString(row.Chemical || ""),
      Sex: normalizeString(row.Sex || ""),
      "Life Cycle Stage": normalizeString(row["Life Cycle Stage"] || ""),
      "Tox Exposure Technique": normalizeString(
        row["Tox Exposure Technique"] || ""
      ),
      Type: normalizeString(row.Type || ""),
      "Tox Exposure Duration_minutes": row["Tox Exposure Duration_minutes"],
      "Sample Size": row["Sample Size"],
    }));

    const chemicals = normalizedRecords.map((row) => row.Chemical);
    const sexes = normalizedRecords.map((row) => row.Sex);
    const lifeCycles = normalizedRecords.map((row) => row["Life Cycle Stage"]);
    const toxExposureTechniques = normalizedRecords.map(
      (row) => row["Tox Exposure Technique"]
    );
    const types = normalizedRecords.map((row) => row.Type);
    const durations = normalizedRecords.map(
      (row) => row["Tox Exposure Duration_minutes"]
    );
    const sampleSizes = normalizedRecords.map((row) => row["Sample Size"]);

    const typeCountsDebug = types.reduce((acc, type) => {
      if (type !== "nr") {
        acc[type] = (acc[type] || 0) + 1;
      }
      return acc;
    }, {});
    console.log(
      "DEBUG: Counts for 'Type' column (after normalization):",
      typeCountsDebug
    );

    // --- 1. Top Chemicals (Bar Chart) ---
    const chemicalCounts = chemicals.reduce((acc, chemical) => {
      if (chemical !== "nr" && chemical !== "") {
        acc[chemical] = (acc[chemical] || 0) + 1;
      }
      return acc;
    }, {});
    const sortedChemicals = Object.entries(chemicalCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    const chemicalLabels = sortedChemicals.map(([label]) => label);
    const chemicalValues = sortedChemicals.map(([, value]) => value);
    const chemicalColors = Array(chemicalLabels.length).fill("#2196F3");

    const chemicalData = {
      labels: chemicalLabels,
      datasets: [
        {
          label: "Number of Studies",
          data: chemicalValues,
          backgroundColor: chemicalColors,
        },
      ],
    };

    // --- 2. Sex Distribution (Doughnut Chart) ---
    const sexCounts = sexes.reduce((acc, sex) => {
      if (sex !== "nr" && sex !== "") {
        acc[sex] = (acc[sex] || 0) + 1;
      }
      return acc;
    }, {});
    const sexLabels = Object.keys(sexCounts).sort();
    const sexValues = sexLabels.map((label) => sexCounts[label]);
    const sexColors = ["#FF5722", "#CDDC39", "#673AB7", "#FF9800", "#009688"];

    const sexData = {
      labels: sexLabels,
      datasets: [
        {
          data: sexValues,
          backgroundColor: sexColors,
        },
      ],
    };

    // --- 3. Life Cycle Stage (Bar Chart) ---
    const lifeCycleCounts = lifeCycles.reduce((acc, stage) => {
      if (stage !== "nr" && stage !== "") {
        acc[stage] = (acc[stage] || 0) + 1;
      }
      return acc;
    }, {});
    const lifeCycleLabels = Object.keys(lifeCycleCounts).sort();
    const lifeCycleValues = lifeCycleLabels.map(
      (label) => lifeCycleCounts[label]
    );
    const lifeCycleColors = Array(lifeCycleLabels.length).fill("#9C27B0");

    const lifeCycleData = {
      labels: lifeCycleLabels,
      datasets: [
        {
          label: "Number of Studies",
          data: lifeCycleValues,
          backgroundColor: lifeCycleColors,
        },
      ],
    };

    // --- 4. Tox Exposure Technique (Bar Chart - with normalization) ---
    const techniqueCounts = toxExposureTechniques.reduce((acc, technique) => {
      if (technique !== "nr" && technique !== "") {
        acc[technique] = (acc[technique] || 0) + 1;
      }
      return acc;
    }, {});
    const sortedTechniquesBar = Object.entries(techniqueCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7);
    const techniqueLabelsBar = sortedTechniquesBar.map(([label]) => label);
    const techniqueValuesBar = sortedTechniquesBar.map(([, value]) => value);
    const techniqueColorsBar = Array(techniqueLabelsBar.length).fill("#00BCD4");

    const toxExposureTechniqueData = {
      labels: techniqueLabelsBar,
      datasets: [
        {
          label: "Number of Studies",
          data: techniqueValuesBar,
          backgroundColor: techniqueColorsBar,
        },
      ],
    };

    // --- 5. Top Exposure Techniques (Polar Area Chart) ---
    const sortedTechniquesPolar = Object.entries(techniqueCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    const polarLabels = sortedTechniquesPolar.map(([label]) => label);
    const polarValues = sortedTechniquesPolar.map(([, value]) => value);
    const polarColors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
    ];

    const topTechniquesPolarData = {
      labels: polarLabels,
      datasets: [
        {
          data: polarValues,
          backgroundColor: polarColors,
        },
      ],
    };

    // --- 6. Tox Exposure Duration (Histogram-like Bar Chart) ---
    const bins = [
      { label: "<1 hr (0-59 min)", min: 0, max: 59 },
      { label: "1-24 hr (60-1439 min)", min: 60, max: 1439 },
      { label: "1-7 days (1440-10079 min)", min: 1440, max: 10079 },
      { label: ">7 days (>=10080 min)", min: 10080, max: Infinity },
    ];

    const durationBins = bins.reduce(
      (acc, bin) => ({ ...acc, [bin.label]: 0 }),
      {}
    );

    const numericDurations = durations
      .filter(
        (d) => d !== "NR" && d !== "nr" && d !== "" && !isNaN(parseFloat(d))
      )
      .map((d) => parseFloat(d));

    numericDurations.forEach((duration) => {
      for (const bin of bins) {
        if (duration >= bin.min && duration <= bin.max) {
          durationBins[bin.label]++;
          break;
        }
      }
    });

    const durationLabels = Object.keys(durationBins);
    const durationValues = Object.values(durationBins);

    const durationData = {
      labels: durationLabels,
      datasets: [
        {
          label: "Number of Studies",
          data: durationValues,
          backgroundColor: Array(durationLabels.length).fill("#FFEB3B"),
        },
      ],
    };

    // --- 7. Sample Size vs. Tox Exposure Duration (Scatter Plot) ---
    const scatterDataPoints = normalizedRecords
      .filter(
        (row) =>
          row["Sample Size"] !== "NR" &&
          row["Sample Size"] !== "nr" &&
          row["Sample Size"] !== "" &&
          !isNaN(parseFloat(row["Sample Size"])) &&
          row["Tox Exposure Duration_minutes"] !== "NR" &&
          row["Tox Exposure Duration_minutes"] !== "nr" &&
          row["Tox Exposure Duration_minutes"] !== "" &&
          !isNaN(parseFloat(row["Tox Exposure Duration_minutes"]))
      )
      .map((row) => ({
        x: parseFloat(row["Tox Exposure Duration_minutes"]),
        y: parseFloat(row["Sample Size"]),
      }));

    const sampleSizeDurationData = {
      datasets: [
        {
          label: "Sample Size vs. Exposure Duration (Minutes)",
          data: scatterDataPoints,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };

    return {
      chemicalData,
      sexData,
      lifeCycleData,
      toxExposureTechniqueData,
      topTechniquesPolarData,
      durationData,
      sampleSizeDurationData,
    };
  } catch (error) {
    console.error("Error loading chart data:", error);
    return getEmptyChartData();
  }
}

// Helper function to return empty chart data structure in case of errors
function getEmptyChartData() {
  const emptyDataset = {
    labels: [],
    datasets: [
      {
        label: "No Data Available",
        data: [],
        backgroundColor: [],
      },
    ],
  };

  return {
    chemicalData: emptyDataset,
    sexData: emptyDataset,
    lifeCycleData: emptyDataset,
    toxExposureTechniqueData: emptyDataset,
    topTechniquesPolarData: emptyDataset,
    durationData: emptyDataset,
    sampleSizeDurationData: {
      datasets: [
        {
          label: "No Data Available",
          data: [],
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    },
  };
}
