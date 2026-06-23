import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Add this import for proper marker icons
import { Icon } from "leaflet";

// Custom colored markers
const fraudIcon = new Icon({
  iconUrl: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='red'><circle cx='12' cy='12' r='10' opacity='0.8'/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const genuineIcon = new Icon({
  iconUrl: `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='green'><circle cx='12' cy='12' r='10' opacity='0.8'/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function ScanMap({ scans }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span>🗺️</span>
          Scan Locations ({scans?.length || 0})
        </h2>
        <p className="text-blue-100 mt-1">All scan locations on map</p>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapContainer 
          center={[20.5937, 78.9629]} 
          zoom={5} 
          style={{ height: "500px", width: "100%" }}
          className="w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {scans?.map((s, i) => (
            <Marker 
              key={i} 
              position={[s.lat, s.lng]}
              icon={s.fraud ? fraudIcon : genuineIcon}
            >
              <Popup className="font-semibold min-w-[250px]">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">
                    {s.productId || 'Product'}
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                    s.fraud 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {s.fraud ? '🚨 Fraud Detected' : '✅ Genuine Product'}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{s.time}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        {scans?.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">Genuine</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="font-medium text-red-800">Fraud</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanMap;