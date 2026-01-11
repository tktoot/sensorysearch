"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  NOISE_LEVELS,
  LIGHTING_LEVELS,
  CROWD_LEVELS,
  DENSITY_LEVELS,
  SENSORY_HELPER_TEXT,
  type NoiseLevel,
  type LightingLevel,
  type CrowdLevel,
  type DensityLevel,
} from "@/lib/constants/sensory-fields"

interface SensoryAccessibilitySectionProps {
  noiseLevel: NoiseLevel | ""
  lightingLevel: LightingLevel | ""
  crowdLevel: CrowdLevel | ""
  densityLevel: DensityLevel | ""
  wheelchairAccessible: boolean
  accessibleParking: boolean
  accessibleRestroom: boolean
  quietSpaceAvailable: boolean
  sensoryFriendlyHours: boolean
  headphonesAllowed: boolean
  staffTrained: boolean
  onNoiseChange: (value: NoiseLevel | "") => void
  onLightingChange: (value: LightingLevel | "") => void
  onCrowdChange: (value: CrowdLevel | "") => void
  onDensityChange: (value: DensityLevel | "") => void
  onWheelchairChange: (checked: boolean) => void
  onAccessibleParkingChange: (checked: boolean) => void
  onAccessibleRestroomChange: (checked: boolean) => void
  onQuietSpaceChange: (checked: boolean) => void
  onSensoryHoursChange: (checked: boolean) => void
  onHeadphonesChange: (checked: boolean) => void
  onStaffTrainedChange: (checked: boolean) => void
  errors?: {
    noiseLevel?: string
    lightingLevel?: string
    crowdLevel?: string
    densityLevel?: string
  }
}

export function SensoryAccessibilitySection({
  noiseLevel,
  lightingLevel,
  crowdLevel,
  densityLevel,
  wheelchairAccessible,
  accessibleParking,
  accessibleRestroom,
  quietSpaceAvailable,
  sensoryFriendlyHours,
  headphonesAllowed,
  staffTrained,
  onNoiseChange,
  onLightingChange,
  onCrowdChange,
  onDensityChange,
  onWheelchairChange,
  onAccessibleParkingChange,
  onAccessibleRestroomChange,
  onQuietSpaceChange,
  onSensoryHoursChange,
  onHeadphonesChange,
  onStaffTrainedChange,
  errors = {},
}: SensoryAccessibilitySectionProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Sensory & Accessibility Information</h3>
        <p className="text-sm text-muted-foreground">{SENSORY_HELPER_TEXT}</p>
      </div>

      {/* Accessibility Checkboxes */}
      <div className="space-y-3">
        <Label className="text-base">Accessibility</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="wheelchair_accessible" checked={wheelchairAccessible} onCheckedChange={onWheelchairChange} />
            <label htmlFor="wheelchair_accessible" className="text-sm cursor-pointer">
              Wheelchair accessible
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="accessible_parking" checked={accessibleParking} onCheckedChange={onAccessibleParkingChange} />
            <label htmlFor="accessible_parking" className="text-sm cursor-pointer">
              Accessible parking available
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accessible_restroom"
              checked={accessibleRestroom}
              onCheckedChange={onAccessibleRestroomChange}
            />
            <label htmlFor="accessible_restroom" className="text-sm cursor-pointer">
              Accessible restroom available
            </label>
          </div>
        </div>
      </div>

      {/* Sensory Environment (Required) */}
      <div className="space-y-4">
        <Label className="text-base">Sensory Environment *</Label>

        <div className="space-y-2">
          <Label htmlFor="noise_level">Noise Level *</Label>
          <RadioGroup value={noiseLevel} onValueChange={onNoiseChange}>
            {NOISE_LEVELS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`noise_${option.value}`} />
                <Label htmlFor={`noise_${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.noiseLevel && <p className="text-sm text-destructive">{errors.noiseLevel}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lighting_level">Lighting Level *</Label>
          <RadioGroup value={lightingLevel} onValueChange={onLightingChange}>
            {LIGHTING_LEVELS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`lighting_${option.value}`} />
                <Label htmlFor={`lighting_${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.lightingLevel && <p className="text-sm text-destructive">{errors.lightingLevel}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="crowd_level">Crowd Level *</Label>
          <RadioGroup value={crowdLevel} onValueChange={onCrowdChange}>
            {CROWD_LEVELS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`crowd_${option.value}`} />
                <Label htmlFor={`crowd_${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.crowdLevel && <p className="text-sm text-destructive">{errors.crowdLevel}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="density_level">Density / Space to Move *</Label>
          <RadioGroup value={densityLevel} onValueChange={onDensityChange}>
            {DENSITY_LEVELS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`density_${option.value}`} />
                <Label htmlFor={`density_${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.densityLevel && <p className="text-sm text-destructive">{errors.densityLevel}</p>}
        </div>
      </div>

      {/* Sensory Supports (Optional) */}
      <div className="space-y-3">
        <Label className="text-base">Sensory Supports (optional)</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="quiet_space" checked={quietSpaceAvailable} onCheckedChange={onQuietSpaceChange} />
            <label htmlFor="quiet_space" className="text-sm cursor-pointer">
              Quiet space available
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sensory_hours" checked={sensoryFriendlyHours} onCheckedChange={onSensoryHoursChange} />
            <label htmlFor="sensory_hours" className="text-sm cursor-pointer">
              Sensory-friendly hours available
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="headphones" checked={headphonesAllowed} onCheckedChange={onHeadphonesChange} />
            <label htmlFor="headphones" className="text-sm cursor-pointer">
              Headphones allowed / encouraged
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="staff_trained" checked={staffTrained} onCheckedChange={onStaffTrainedChange} />
            <label htmlFor="staff_trained" className="text-sm cursor-pointer">
              Staff trained in sensory awareness (optional)
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
