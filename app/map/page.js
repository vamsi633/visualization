// app/page.js
import CaliforniaMap from "../../components/californiaMap";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center py-8 px-4 md:px-16">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        CalEcoTox: California Map Prototype
      </h1>
      <p className="mb-4 text-center text-gray-700">
        This is a blank Mapbox GL JS map centered on California. Next, we’ll overlay the GeoJSON boundary.
      </p>
      <CaliforniaMap />
    </main>
  );
}
