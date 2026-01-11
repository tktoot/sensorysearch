"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { EVENT_CROWD_SIZE } from "@/lib/constants/sensory-fields"

interface EventSpecificSectionProps {
  amplifiedSound: boolean
  flashingLights: boolean
  indoorEvent: boolean
  outdoorEvent: boolean
  expectedCrowdSize: string
  onAmplifiedSoundChange: (checked: boolean) => void
  onFlashingLightsChange: (checked: boolean) => void
  onIndoorEventChange: (checked: boolean) => void
  onOutdoorEventChange: (checked: boolean) => void
  onCrowdSizeChange: (value: string) => void
}

export function EventSpecificSection({
  amplifiedSound,
  flashingLights,
  indoorEvent,
  outdoorEvent,
  expectedCrowdSize,
  onAmplifiedSoundChange,
  onFlashingLightsChange,
  onIndoorEventChange,
  onOutdoorEventChange,
  onCrowdSizeChange,
}: EventSpecificSectionProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Event Environment</h3>
      </div>

      {/* Event Dynamics */}
      <div className="space-y-3">
        <Label className="text-base">Event Dynamics</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="amplified_sound" checked={amplifiedSound} onCheckedChange={onAmplifiedSoundChange} />
            <label htmlFor="amplified_sound" className="text-sm cursor-pointer">
              Amplified sound used
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="flashing_lights" checked={flashingLights} onCheckedChange={onFlashingLightsChange} />
            <label htmlFor="flashing_lights" className="text-sm cursor-pointer">
              Flashing or strobe lights used
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="indoor_event" checked={indoorEvent} onCheckedChange={onIndoorEventChange} />
            <label htmlFor="indoor_event" className="text-sm cursor-pointer">
              Indoor event
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="outdoor_event" checked={outdoorEvent} onCheckedChange={onOutdoorEventChange} />
            <label htmlFor="outdoor_event" className="text-sm cursor-pointer">
              Outdoor event
            </label>
          </div>
        </div>
      </div>

      {/* Attendance Expectation */}
      <div className="space-y-2">
        <Label className="text-base">Expected Crowd Size</Label>
        <RadioGroup value={expectedCrowdSize} onValueChange={onCrowdSizeChange}>
          {EVENT_CROWD_SIZE.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`crowd_size_${option.value}`} />
              <Label htmlFor={`crowd_size_${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
