"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PARK_FENCING_OPTIONS } from "@/lib/constants/sensory-fields"

interface ParkSpecificSectionProps {
  fencingType: string
  petsAllowed: boolean
  dogsOnLeash: boolean
  noPets: boolean
  shadedAreas: boolean
  benchesSeating: boolean
  softGround: boolean
  onFencingChange: (value: string) => void
  onPetsAllowedChange: (checked: boolean) => void
  onDogsOnLeashChange: (checked: boolean) => void
  onNoPetsChange: (checked: boolean) => void
  onShadedAreasChange: (checked: boolean) => void
  onBenchesSeatingChange: (checked: boolean) => void
  onSoftGroundChange: (checked: boolean) => void
}

export function ParkSpecificSection({
  fencingType,
  petsAllowed,
  dogsOnLeash,
  noPets,
  shadedAreas,
  benchesSeating,
  softGround,
  onFencingChange,
  onPetsAllowedChange,
  onDogsOnLeashChange,
  onNoPetsChange,
  onShadedAreasChange,
  onBenchesSeatingChange,
  onSoftGroundChange,
}: ParkSpecificSectionProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Park & Playground Details</h3>
      </div>

      {/* Safety & Layout */}
      <div className="space-y-2">
        <Label className="text-base">Safety & Layout</Label>
        <RadioGroup value={fencingType} onValueChange={onFencingChange}>
          {PARK_FENCING_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`fence_${option.value}`} />
              <Label htmlFor={`fence_${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Pets & Animals */}
      <div className="space-y-3">
        <Label className="text-base">Pets & Animals</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="pets_allowed" checked={petsAllowed} onCheckedChange={onPetsAllowedChange} />
            <label htmlFor="pets_allowed" className="text-sm cursor-pointer">
              Pets allowed
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="dogs_on_leash" checked={dogsOnLeash} onCheckedChange={onDogsOnLeashChange} />
            <label htmlFor="dogs_on_leash" className="text-sm cursor-pointer">
              Dogs allowed on leash
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="no_pets" checked={noPets} onCheckedChange={onNoPetsChange} />
            <label htmlFor="no_pets" className="text-sm cursor-pointer">
              No pets allowed
            </label>
          </div>
        </div>
      </div>

      {/* Environment & Amenities */}
      <div className="space-y-3">
        <Label className="text-base">Environment & Amenities (optional)</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="shaded_areas" checked={shadedAreas} onCheckedChange={onShadedAreasChange} />
            <label htmlFor="shaded_areas" className="text-sm cursor-pointer">
              Shaded areas available
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="benches_seating" checked={benchesSeating} onCheckedChange={onBenchesSeatingChange} />
            <label htmlFor="benches_seating" className="text-sm cursor-pointer">
              Benches or seating available
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="soft_ground" checked={softGround} onCheckedChange={onSoftGroundChange} />
            <label htmlFor="soft_ground" className="text-sm cursor-pointer">
              Soft ground surface (rubber mulch, turf, etc.)
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
