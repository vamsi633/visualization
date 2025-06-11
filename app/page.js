"use client";

import { useState, useEffect } from "react";
import RealCSVDataMap from "@/components/realCSVDataMap";
import TopChemicalsBarChart from "@/components/chemical";
import SampleSizeDurationScatterPlot from "@/components/samplesize";
import SexDistributionDoughnutChart from "@/components/sexd";
import DurationHistogramChart from "@/components/duration";
import LifeCycleBarChart from "@/components/lifecycle";
import TopTechniquesPolarAreaChart from "@/components/TopTech";
import ToxExposureTechniqueBarChart from "@/components/exposure";
import { getChartData } from "@/utils/data";

export default function HomePage() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing', 'dataset-info', 'map', or 'charts'
  const [showButton, setShowButton] = useState(false);

  const titleText = "CalEcoTox: Toxic Substance Report";
  const courseText = "CSEN 377: Data Visualization - Spring 2025";
  const groupText = "Group-9";

  const useTypewriter = (text, speed = 100, delay = 0) => {
    const [displayText, setDisplayText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      const delayTimer = setTimeout(() => {
        let currentIndex = 0;

        const typeTimer = setInterval(() => {
          if (currentIndex < text.length) {
            setDisplayText(text.slice(0, currentIndex + 1));
            currentIndex++;
          } else {
            setIsComplete(true);
            clearInterval(typeTimer);
          }
        }, speed);

        return () => clearInterval(typeTimer);
      }, delay);

      return () => clearTimeout(delayTimer);
    }, [text, speed, delay]);

    return { displayText, isComplete };
  };

  const courseTypewriter = useTypewriter(courseText, 60, 800);

  const titleTypewriter = useTypewriter(titleText, 80, 500);

  const groupTypewriter = useTypewriter(groupText, 100, 1100);

  useEffect(() => {
    if (
      titleTypewriter.isComplete &&
      courseTypewriter.isComplete &&
      groupTypewriter.isComplete
    ) {
      const buttonTimer = setTimeout(() => {
        setShowButton(true);
      }, 1500);

      return () => clearTimeout(buttonTimer);
    }
  }, [
    titleTypewriter.isComplete,
    courseTypewriter.isComplete,
    groupTypewriter.isComplete,
  ]);

  // Landing Page View
  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white min-h-[4rem] md:min-h-[6rem] flex items-center justify-center">
              {titleTypewriter.displayText}
              {!titleTypewriter.isComplete && (
                <span className="animate-pulse ml-1 text-blue-400">|</span>
              )}
            </h1>

            <h2 className="text-xl md:text-2xl text-gray-300 min-h-[2rem] flex items-center justify-center">
              {courseTypewriter.displayText}
              {courseTypewriter.displayText && !courseTypewriter.isComplete && (
                <span className="animate-pulse ml-1 text-green-400">|</span>
              )}
            </h2>

            <h3 className="text-lg md:text-xl font-semibold text-gray-200 min-h-[1.5rem] flex items-center justify-center">
              {groupTypewriter.displayText}
              {groupTypewriter.displayText && !groupTypewriter.isComplete && (
                <span className="animate-pulse ml-1 text-blue-400">|</span>
              )}
            </h3>
          </div>

          <div className="py-8">
            <div className="flex justify-center items-center space-x-4 text-gray-500">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1 max-w-32"></div>
              <div className="text-2xl">🧪</div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1 max-w-32"></div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-gray-300 text-lg leading-relaxed">
              Interactive mapping and visualization of chemical contamination
              data across California counties using EPA ECOTOX database
            </p>
          </div>

          <div className="pt-8">
            {showButton && (
              <div
                className="opacity-0 translate-y-4 animate-fade-in-smooth"
                style={{
                  animation: "fadeInSmooth 1.2s ease-out forwards",
                }}
              >
                <button
                  onClick={() => setCurrentView("dataset-info")}
                  className="group inline-flex items-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-400/30"
                >
                  <span className="text-lg">Explore Dataset</span>
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="pt-12 text-center">
            <p className="text-gray-500 text-sm">
              Santa Clara University • Computer Science & Engineering • Spring
              2025
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dataset Information Page View
  if (currentView === "dataset-info") {
    return <DatasetInfoView setCurrentView={setCurrentView} />;
  }

  // Charts Page View
  if (currentView === "charts") {
    return <ChartsView setCurrentView={setCurrentView} />;
  }

  // Map Page View
  if (currentView === "map") {
    return (
      <main className="flex flex-col items-center py-8 px-4 md:px-16 bg-black min-h-screen">
        <div className="w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              CalEcoTox: Chemical Hotspot Analysis
            </h1>
            <p className="text-lg text-gray-300 mb-2">
              Interactive mapping of chemical contamination across California
              counties
            </p>
            <p className="text-sm text-gray-400 max-w-3xl mx-auto">
              Explore toxicity data from 6,014 ECOTOX studies. Filter by
              chemical compounds and species to identify environmental risk
              hotspots. Click markers for detailed contamination data.
            </p>

            {/* Enhanced Navigation */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <button
                onClick={() => setCurrentView("landing")}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-blue-400 font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Home</span>
              </button>

              <span className="text-gray-600">•</span>

              <button
                onClick={() => setCurrentView("dataset-info")}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-blue-400 font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Dataset Info</span>
              </button>

              <span className="text-gray-600">•</span>

              <span className="inline-flex items-center space-x-2 text-blue-400 font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span>Interactive Map</span>
              </span>

              <span className="text-gray-600">•</span>

              <button
                onClick={() => setCurrentView("charts")}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-blue-400 font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Charts & Analysis</span>
              </button>
            </div>
          </div>

          <RealCSVDataMap />
        </div>
      </main>
    );
  }
}

// Dataset Information Component
const DatasetInfoView = ({ setCurrentView }) => {
  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Understanding CalEcoTox Data
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Comprehensive wildlife biology, exposure factors, and toxicity data
            supporting ecotoxicological risk assessments for California species
          </p>

          {/* Navigation Breadcrumb */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-400">
            <button
              onClick={() => setCurrentView("landing")}
              className="hover:text-blue-400 transition-colors"
            >
              Home
            </button>
            <span>→</span>
            <span className="text-white font-medium">Dataset Overview</span>
            <span>→</span>
            <button
              onClick={() => setCurrentView("map")}
              className="hover:text-blue-400 transition-colors"
            >
              Interactive Map
            </button>
            <span>→</span>
            <button
              onClick={() => setCurrentView("charts")}
              className="hover:text-blue-400 transition-colors"
            >
              Charts & Analysis
            </button>
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Total Studies
                </p>
                <p className="text-3xl font-bold text-white">6,014</p>
              </div>
              <div className="p-3 bg-blue-900 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Comprehensive research database
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Chemical Compounds
                </p>
                <p className="text-3xl font-bold text-white">225</p>
              </div>
              <div className="p-3 bg-green-900 rounded-full">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Diverse toxicological substances
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Wildlife Species
                </p>
                <p className="text-3xl font-bold text-white">90+</p>
              </div>
              <div className="p-3 bg-purple-900 rounded-full">
                <svg
                  className="w-8 h-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              California wildlife focus
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Study Locations
                </p>
                <p className="text-3xl font-bold text-white">58</p>
              </div>
              <div className="p-3 bg-orange-900 rounded-full">
                <svg
                  className="w-8 h-8 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">California counties</p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Species Data Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                Species-Specific Data
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4 leading-relaxed">
                Comprehensive biological information covering over 90 California
                wildlife species across five major taxonomic groups.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-200">🐦 Birds</span>
                  <span className="text-sm text-gray-400">Largest group</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-200">🦌 Mammals</span>
                  <span className="text-sm text-gray-400">
                    Terrestrial focus
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-200">🦎 Reptiles</span>
                  <span className="text-sm text-gray-400">
                    Semi-terrestrial
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-200">
                    🐸 Amphibians
                  </span>
                  <span className="text-sm text-gray-400">
                    Sensitive indicators
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="font-medium text-gray-200">🐟 Fish</span>
                  <span className="text-sm text-gray-400">Recent addition</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exposure Factors Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Exposure Factors
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4 leading-relaxed">
                Quantitative metrics measuring how species interact with their
                environment and accumulate chemical substances.
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-gray-200">
                    Population Density
                  </h4>
                  <p className="text-sm text-gray-400">
                    Spatial distribution patterns across habitats
                  </p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-gray-200">
                    Metabolic Rates
                  </h4>
                  <p className="text-sm text-gray-400">
                    Energy consumption and oxygen uptake measurements
                  </p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-gray-200">
                    Chemical Accumulation
                  </h4>
                  <p className="text-sm text-gray-400">
                    Tissue concentration and bioaccumulation factors
                  </p>
                </div>
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-gray-200">
                    Transfer Rates
                  </h4>
                  <p className="text-sm text-gray-400">
                    Prey-to-predator chemical transmission
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Toxicity Endpoints Card */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                Toxicity Endpoints
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4 leading-relaxed">
                Multi-level toxicological effects ranging from molecular
                biomarkers to population-scale impacts.
              </p>

              <div className="space-y-4">
                <div className="bg-purple-50/10 border border-purple-600 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    Accumulation Effects
                  </h4>
                  <p className="text-sm text-gray-400">
                    Chemical buildup patterns and bioconcentration factors in
                    target tissues
                  </p>
                </div>
                <div className="bg-purple-50/10 border border-purple-600 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    Molecular Biomarkers
                  </h4>
                  <p className="text-sm text-gray-400">
                    Early-warning indicators of chemical exposure at the
                    cellular level
                  </p>
                </div>
                <div className="bg-purple-50/10 border border-purple-600 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    Individual Effects
                  </h4>
                  <p className="text-sm text-gray-400">
                    Growth, reproduction, and survival impacts on individual
                    organisms
                  </p>
                </div>
                <div className="bg-purple-50/10 border border-purple-600 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-300 mb-2">
                    Population Dynamics
                  </h4>
                  <p className="text-sm text-gray-400">
                    Community-level changes and ecosystem-wide effects
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources and Methodology */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Data Sources and Scientific Methodology
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Research Foundation
              </h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                Built upon the robust framework of the US EPA&apos;s Wildlife
                Exposure Factor Handbook, our database expands this foundation
                specifically for California&apos;s unique ecosystems and species
                assemblages.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Data compilation draws from peer-reviewed wildlife toxicology
                literature, government environmental monitoring programs, and
                specialized ecotoxicological databases to ensure scientific
                rigor and accuracy.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Quality Assurance
              </h4>
              <p className="text-gray-300 leading-relaxed mb-4">
                Each data point undergoes systematic validation processes
                including source verification, unit standardization, and
                cross-reference checking against multiple independent studies.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Geographic specificity ensures relevance to California&apos;s
                environmental conditions while maintaining scientific standards
                for extrapolation from studies conducted in similar ecosystems.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Explore the Data?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Dive into our interactive mapping interface to visualize chemical
              contamination patterns, species vulnerability, and regional risk
              assessments across California counties.
            </p>
            <button
              onClick={() => setCurrentView("map")}
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center space-x-2"
            >
              <span>Launch Interactive Map</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Charts View Component
const ChartsView = ({ setCurrentView }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await getChartData();
        console.log("Chart data loaded:", data); // Debug: Inspect the data
        setChartData(data);
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Show loading message while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-white text-xl">Loading charts...</p>
        </div>
      </div>
    );
  }

  // Show error message if data failed to load
  if (!chartData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400 text-xl">
          Failed to load chart data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            EcoToxicity Research Analysis
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Comprehensive visualization and analysis of ecotoxicity research
            patterns, methodologies, and trends across California environmental
            studies
          </p>

          {/* Navigation Breadcrumb */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-400">
            <button
              onClick={() => setCurrentView("landing")}
              className="hover:text-blue-400 transition-colors"
            >
              Home
            </button>
            <span>→</span>
            <button
              onClick={() => setCurrentView("dataset-info")}
              className="hover:text-blue-400 transition-colors"
            >
              Dataset Overview
            </button>
            <span>→</span>
            <button
              onClick={() => setCurrentView("map")}
              className="hover:text-blue-400 transition-colors"
            >
              Interactive Map
            </button>
            <span>→</span>
            <span className="text-white font-medium">Charts & Analysis</span>
          </div>
        </div>

        {/* Chart Group 1: Techniques & Sex Distribution (Polar & Doughnut Charts) */}
        <section className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-8 w-full">
          <div className="flex flex-col items-center w-full md:w-5/12 lg:w-5/12">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              1. How Are Exposures Typically Administered? (Initial View)
            </h3>
            <p className="text-sm sm:text-base text-white text-center mb-6 max-w-prose">
              We begin our exploration by examining the primary methods used to
              administer toxic exposures in these studies. This Polar Area Chart
              provides a unique, radial view of the top 3 exposure techniques,
              allowing for a quick visual comparison of their relative
              prevalence. It sets the stage for understanding experimental
              design.
            </p>
            <TopTechniquesPolarAreaChart
              data={chartData.topTechniquesPolarData}
            />
          </div>

          <div className="flex flex-col items-center w-full md:w-5/12 lg:w-5/12">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              2. Understanding the Subjects: Sex Distribution
            </h3>
            <p className="text-sm sm:text-base text-white text-center mb-6 max-w-prose">
              Moving from &quot;what&quot; to &quot;who,&quot; this doughnut
              chart provides a clear view of the sex distribution among the
              studied organisms. It reveals whether studies primarily focus on
              males, females, or if the sex is often not reported. This helps
              identify potential biases or areas of concentrated research.
            </p>
            <SexDistributionDoughnutChart data={chartData.sexData} />
          </div>
        </section>

        {/* Chart Group 2: Chemicals & Life Cycle Stage (Bar Charts) */}
        <section className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-8 w-full mt-12">
          <div className="flex flex-col items-center w-full md:w-5/12 lg:w-5/12">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              3. Which Chemicals Are Under the Microscope?
            </h3>
            <p className="text-sm sm:text-base text-white text-center mb-6 max-w-prose">
              Next, we delve into the core of ecotoxicity research: the
              chemicals themselves. This bar chart highlights the top 10 most
              frequently studied chemicals, giving us insight into substances of
              particular environmental concern or research interest. It shows
              where the scientific focus is primarily directed.
            </p>
            <TopChemicalsBarChart data={chartData.chemicalData} />
          </div>

          <div className="flex flex-col items-center w-full md:w-5/12 lg:w-5/12">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              4. Understanding the Subjects: Life Cycle Stage
            </h3>
            <p className="text-sm sm:text-base text-white text-center mb-6 max-w-prose">
              Complementing the sex distribution, this bar chart illustrates the
              focus on various life cycle stages (e.g., Adult, Juvenile,
              Tadpole) in ecotoxicity studies. It highlights which developmental
              periods are most frequently assessed for chemical impacts.
            </p>
            <LifeCycleBarChart data={chartData.lifeCycleData} />
          </div>
        </section>

        {/* Chart Group 3: Exposure Details (Bar Chart & Histogram) */}
        <section className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-8 w-full mt-12">
          <div className="flex flex-col items-center w-full md:w-5/12 lg:w-5/12">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              5. Detailed View: Most Common Exposure Techniques
            </h3>
            <p className="text-sm sm:text-base text-white text-center mb-6 max-w-prose">
              Expanding on the initial view, this bar chart provides a more
              detailed look at the top exposure techniques. While the Polar Area
              chart gave a quick proportional overview, this bar chart allows
              for precise comparison of the absolute counts for each method,
              reinforcing methodological trends.
            </p>
            <ToxExposureTechniqueBarChart
              data={chartData.toxExposureTechniqueData}
            />
          </div>

          <div className="flex flex-col items-center w-full md:w-5/12 lg:w-5/12">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
              6. How Long Do Exposures Last?
            </h3>
            <p className="text-sm sm:text-base text-white text-center mb-6 max-w-prose">
              We examine the temporal aspect of these exposures. This chart,
              acting as a histogram, visualizes the distribution of exposure
              durations, categorized into logical time bins (e.g., hours, days,
              weeks). This helps identify if studies typically focus on acute,
              short-term, or chronic exposures.
            </p>
            <DurationHistogramChart data={chartData.durationData} />
          </div>
        </section>

        {/* Chart 7: Relationship (Scatter Plot) */}
        <section className="flex flex-col items-center w-full mt-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">
            7. Exploring Relationships: Sample Size vs. Exposure Duration
          </h3>
          <p className="text-sm sm:text-base text-white text-center mb-6 max-w-prose">
            Finally, this scatter plot allows us to investigate potential
            relationships between the sample size used in studies and the
            duration of the toxic exposure. Are larger studies typically longer,
            or are there different trends? This can reveal insights into
            experimental design choices.
          </p>
          <SampleSizeDurationScatterPlot
            data={chartData.sampleSizeDurationData}
          />
        </section>

        {/* Conclusion */}
        <section className="text-white text-center mt-12 mb-8 px-4">
          <h3 className="text-3xl sm:text-4xl font-semibold mb-4">
            Conclusion: Key Insights and Future Directions
          </h3>
          <p className="text-base sm:text-lg">
            Through these diverse visualizations, we&apos;ve gained a clearer
            picture of ecotoxicity research patterns: from study types and key
            chemicals to subjects, methodologies, durations, and even
            experimental design relationships. This comprehensive view helps in
            identifying trends, understanding research priorities, and
            potentially highlighting areas for future investigation in
            environmental toxicology.
          </p>
        </section>

        {/* Navigation to Other Views */}
        <div className="text-center mt-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Explore More Data Visualizations
            </h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Continue your exploration with our interactive map to see chemical
              hotspots across California counties, or return to the dataset
              overview for more context.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setCurrentView("map")}
                className="bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center space-x-2"
              >
                <span>View Interactive Map</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </button>

              <button
                onClick={() => setCurrentView("dataset-info")}
                className="bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-300 inline-flex items-center space-x-2"
              >
                <span>Dataset Overview</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
