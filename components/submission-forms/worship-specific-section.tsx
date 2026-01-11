import { Checkbox } from "@/components/ui/checkbox"

interface WorshipSpecificSectionProps {
  sensoryFriendlyService: boolean
  quietCryRoom: boolean
  flexibleSeating: boolean
  sensoryKits: boolean
  onSensoryServiceChange: (checked: boolean) => void
  onQuietRoomChange: (checked: boolean) => void
  onFlexibleSeatingChange: (checked: boolean) => void
  onSensoryKitsChange: (checked: boolean) => void
}

export function WorshipSpecificSection({
  sensoryFriendlyService,
  quietCryRoom,
  flexibleSeating,
  sensoryKits,
  onSensoryServiceChange,
  onQuietRoomChange,
  onFlexibleSeatingChange,
  onSensoryKitsChange,
}: WorshipSpecificSectionProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Worship Experience Details</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sensory_friendly_service"
            checked={sensoryFriendlyService}
            onCheckedChange={onSensoryServiceChange}
          />
          <label htmlFor="sensory_friendly_service" className="text-sm cursor-pointer">
            Sensory-friendly service available
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="quiet_cry_room" checked={quietCryRoom} onCheckedChange={onQuietRoomChange} />
          <label htmlFor="quiet_cry_room" className="text-sm cursor-pointer">
            Quiet room or cry room available
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="flexible_seating" checked={flexibleSeating} onCheckedChange={onFlexibleSeatingChange} />
          <label htmlFor="flexible_seating" className="text-sm cursor-pointer">
            Flexible seating available
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="sensory_kits" checked={sensoryKits} onCheckedChange={onSensoryKitsChange} />
          <label htmlFor="sensory_kits" className="text-sm cursor-pointer">
            Headphones or sensory kits available
          </label>
        </div>
      </div>
    </div>
  )
}
