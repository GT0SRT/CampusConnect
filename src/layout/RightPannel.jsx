export default function RightPannel() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-semibold mb-3">Trending on Campus</h3>
        <ul className="text-sm space-y-2 text-gray-600">
          <li>#Placements2025</li>
          <li>#GATEPrep</li>
          <li>#TechFest</li>
        </ul>
      </div>

      <div className="bg-white rounded-xl p-4">
        <h3 className="font-semibold mb-3">Upcoming Events</h3>
        <p className="text-sm text-gray-600">TechFest 2025 – Jan 15</p>
      </div>
    </div>
  );
}