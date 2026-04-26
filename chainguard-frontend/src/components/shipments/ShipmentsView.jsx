import { useState } from 'react'
import { Package } from 'lucide-react'
import ShipmentTable from './ShipmentTable'
import ShipmentDetailPanel from './ShipmentDetailPanel'
import { useShipments } from '../../hooks/useShipments'

export default function ShipmentsView({ onNavigate }) {
  const { data: shipments, loading } = useShipments()
  const [selectedShipment, setSelectedShipment] = useState(null)

  function handleOptimizeRoute(origin, dest) {
    setSelectedShipment(null)
    onNavigate('optimizer', { origin, destination: dest })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary font-bold text-lg">Shipment Management</h2>
          <p className="text-text-muted text-sm">{shipments.length} total shipments tracked</p>
        </div>
      </div>
      <ShipmentTable
        shipments={shipments}
        loading={loading}
        onViewDetail={setSelectedShipment}
      />
      {selectedShipment && (
        <ShipmentDetailPanel
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onOptimizeRoute={handleOptimizeRoute}
        />
      )}
    </div>
  )
}
