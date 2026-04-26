import ShipmentMap from '../map/ShipmentMap'

export default function MapView({ selectedRoute }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Live Shipment Map</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Real-time shipment tracking across India. Click markers for details.</p>
      </div>
      <ShipmentMap selectedRoute={selectedRoute} />
    </div>
  )
}
