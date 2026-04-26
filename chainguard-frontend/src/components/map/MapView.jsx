import ShipmentMap from '../map/ShipmentMap'

export default function MapView({ selectedRoute }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-text-primary font-bold text-lg">Live Shipment Map</h2>
        <p className="text-text-muted text-sm">Real-time shipment tracking across India. Click markers for details.</p>
      </div>
      <ShipmentMap selectedRoute={selectedRoute} />
    </div>
  )
}
