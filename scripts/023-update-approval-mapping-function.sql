-- Update the approve_submission function to properly map new sensory/accessibility fields

CREATE OR REPLACE FUNCTION approve_submission(
  submission_id UUID,
  reviewer_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_submission RECORD;
  v_entity_id UUID;
  v_hero_image TEXT;
  v_photo_urls TEXT[];
BEGIN
  -- Fetch the submission
  SELECT * INTO v_submission
  FROM listings
  WHERE id = submission_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;

  -- Extract hero image and photo URLs from images array
  IF v_submission.images IS NOT NULL AND array_length(v_submission.images, 1) > 0 THEN
    v_hero_image := v_submission.images[1];
    IF array_length(v_submission.images, 1) > 1 THEN
      v_photo_urls := v_submission.images[2:array_length(v_submission.images, 1)];
    END IF;
  END IF;

  -- Promote to appropriate final table based on type
  CASE v_submission.type
    WHEN 'event' THEN
      INSERT INTO events (
        name, description, category,
        address, city, state, zip,
        email, phone, website, social_link,
        event_date, event_start_time, event_end_time,
        noise_level, lighting_level, crowd_level, density_level,
        wheelchair_accessible, accessible_parking, accessible_restroom,
        quiet_space_available, sensory_friendly_hours, headphones_allowed, staff_trained,
        amplified_sound, flashing_lights, indoor_event, outdoor_event, expected_crowd_size,
        hero_image_url, images,
        organizer_id, submission_id, published_at
      )
      VALUES (
        v_submission.title,
        v_submission.description,
        v_submission.category,
        v_submission.address,
        v_submission.city,
        v_submission.state,
        v_submission.zip,
        v_submission.email,
        v_submission.phone,
        v_submission.website,
        v_submission.social_link,
        v_submission.event_date,
        v_submission.event_start_time,
        v_submission.event_end_time,
        -- Extract from JSONB payload with fallbacks
        COALESCE((v_submission.sensory_features::jsonb->>'noiseLevel')::text, v_submission.noise_level),
        COALESCE((v_submission.sensory_features::jsonb->>'lightingLevel')::text, v_submission.lighting),
        COALESCE((v_submission.sensory_features::jsonb->>'crowdLevel')::text, v_submission.crowd_level),
        COALESCE((v_submission.sensory_features::jsonb->>'densityLevel')::text, 'moderate'),
        COALESCE((v_submission.sensory_features::jsonb->>'wheelchairAccessible')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'accessibleParking')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'accessibleRestroom')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'quietSpaceAvailable')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'sensoryFriendlyHours')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'headphonesAllowed')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'staffTrained')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'amplifiedSound')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'flashingLights')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'indoorEvent')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'outdoorEvent')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'expectedCrowdSize')::text, ''),
        v_hero_image,
        v_submission.images,
        v_submission.organizer_id,
        v_submission.id,
        NOW()
      )
      RETURNING id INTO v_entity_id;

    WHEN 'venue' THEN
      INSERT INTO venues (
        name, description, category,
        address, city, state, zip,
        email, phone, website, social_link,
        hours,
        noise_level, lighting_level, crowd_level, density_level,
        wheelchair_accessible, accessible_parking, accessible_restroom,
        quiet_space_available, sensory_friendly_hours, headphones_allowed, staff_trained,
        hero_image_url, images,
        organizer_id, submission_id, published_at
      )
      VALUES (
        v_submission.title,
        v_submission.description,
        v_submission.category,
        v_submission.address,
        v_submission.city,
        v_submission.state,
        v_submission.zip,
        v_submission.email,
        v_submission.phone,
        v_submission.website,
        v_submission.social_link,
        COALESCE((v_submission.sensory_features::jsonb->>'hours')::text, ''),
        COALESCE((v_submission.sensory_features::jsonb->>'noiseLevel')::text, v_submission.noise_level),
        COALESCE((v_submission.sensory_features::jsonb->>'lightingLevel')::text, v_submission.lighting),
        COALESCE((v_submission.sensory_features::jsonb->>'crowdLevel')::text, v_submission.crowd_level),
        COALESCE((v_submission.sensory_features::jsonb->>'densityLevel')::text, 'moderate'),
        COALESCE((v_submission.sensory_features::jsonb->>'wheelchairAccessible')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'accessibleParking')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'accessibleRestroom')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'quietSpaceAvailable')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'sensoryFriendlyHours')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'headphonesAllowed')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'staffTrained')::boolean, false),
        v_hero_image,
        v_submission.images,
        v_submission.organizer_id,
        v_submission.id,
        NOW()
      )
      RETURNING id INTO v_entity_id;

    WHEN 'park', 'playground' THEN
      -- Determine target table
      IF v_submission.type = 'park' THEN
        INSERT INTO parks (
          name, description,
          address, city, state, zip,
          email, phone, website,
          hours,
          noise_level, lighting_level, crowd_level, density_level,
          wheelchair_accessible, accessible_parking, accessible_restroom,
          quiet_space_available, sensory_friendly_hours, headphones_allowed, staff_trained,
          fencing_type, pets_allowed, dogs_on_leash, no_pets,
          shaded_areas, benches_seating, soft_ground,
          hero_image_url, images,
          organizer_id, submission_id, published_at
        )
        VALUES (
          v_submission.title,
          v_submission.description,
          v_submission.address,
          v_submission.city,
          v_submission.state,
          v_submission.zip,
          v_submission.email,
          v_submission.phone,
          v_submission.website,
          COALESCE((v_submission.sensory_features::jsonb->>'hours')::text, ''),
          COALESCE((v_submission.sensory_features::jsonb->>'noiseLevel')::text, v_submission.noise_level),
          COALESCE((v_submission.sensory_features::jsonb->>'lightingLevel')::text, 'moderate'),
          COALESCE((v_submission.sensory_features::jsonb->>'crowdLevel')::text, v_submission.crowd_level),
          COALESCE((v_submission.sensory_features::jsonb->>'densityLevel')::text, 'moderate'),
          COALESCE((v_submission.sensory_features::jsonb->>'wheelchairAccessible')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'accessibleParking')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'accessibleRestroom')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'quietSpaceAvailable')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'sensoryFriendlyHours')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'headphonesAllowed')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'staffTrained')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'fencingType')::text, ''),
          COALESCE((v_submission.sensory_features::jsonb->>'petsAllowed')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'dogsOnLeash')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'noPets')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'shadedAreas')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'benchesSeating')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'softGround')::boolean, false),
          v_hero_image,
          v_submission.images,
          v_submission.organizer_id,
          v_submission.id,
          NOW()
        )
        RETURNING id INTO v_entity_id;
      ELSE
        INSERT INTO playgrounds (
          name, description,
          address, city, state, zip,
          email, phone, website,
          hours,
          noise_level, lighting_level, crowd_level, density_level,
          wheelchair_accessible, accessible_parking, accessible_restroom,
          quiet_space_available, sensory_friendly_hours, headphones_allowed, staff_trained,
          fencing_type, pets_allowed, dogs_on_leash, no_pets,
          shaded_areas, benches_seating, soft_ground,
          hero_image_url, images,
          organizer_id, submission_id, published_at
        )
        VALUES (
          v_submission.title,
          v_submission.description,
          v_submission.address,
          v_submission.city,
          v_submission.state,
          v_submission.zip,
          v_submission.email,
          v_submission.phone,
          v_submission.website,
          COALESCE((v_submission.sensory_features::jsonb->>'hours')::text, ''),
          COALESCE((v_submission.sensory_features::jsonb->>'noiseLevel')::text, v_submission.noise_level),
          COALESCE((v_submission.sensory_features::jsonb->>'lightingLevel')::text, 'moderate'),
          COALESCE((v_submission.sensory_features::jsonb->>'crowdLevel')::text, v_submission.crowd_level),
          COALESCE((v_submission.sensory_features::jsonb->>'densityLevel')::text, 'moderate'),
          COALESCE((v_submission.sensory_features::jsonb->>'wheelchairAccessible')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'accessibleParking')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'accessibleRestroom')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'quietSpaceAvailable')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'sensoryFriendlyHours')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'headphonesAllowed')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'staffTrained')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'fencingType')::text, ''),
          COALESCE((v_submission.sensory_features::jsonb->>'petsAllowed')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'dogsOnLeash')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'noPets')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'shadedAreas')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'benchesSeating')::boolean, false),
          COALESCE((v_submission.sensory_features::jsonb->>'softGround')::boolean, false),
          v_hero_image,
          v_submission.images,
          v_submission.organizer_id,
          v_submission.id,
          NOW()
        )
        RETURNING id INTO v_entity_id;
      END IF;

    WHEN 'place_of_worship' THEN
      INSERT INTO places_of_worship (
        name, description, denomination,
        address, city, state, zip,
        email, phone, website, social_link,
        service_times,
        noise_level, lighting_level, crowd_level, density_level,
        wheelchair_accessible, accessible_parking, accessible_restroom,
        quiet_space_available, sensory_friendly_hours, headphones_allowed, staff_trained,
        sensory_friendly_service, quiet_cry_room, flexible_seating, sensory_kits,
        hero_image_url, images,
        organizer_id, submission_id, published_at
      )
      VALUES (
        v_submission.title,
        v_submission.description,
        COALESCE((v_submission.sensory_features::jsonb->>'denomination')::text, ''),
        v_submission.address,
        v_submission.city,
        v_submission.state,
        v_submission.zip,
        v_submission.email,
        v_submission.phone,
        v_submission.website,
        v_submission.social_link,
        COALESCE((v_submission.sensory_features::jsonb->>'serviceTimes')::text, ''),
        COALESCE((v_submission.sensory_features::jsonb->>'noiseLevel')::text, v_submission.noise_level),
        COALESCE((v_submission.sensory_features::jsonb->>'lightingLevel')::text, v_submission.lighting),
        COALESCE((v_submission.sensory_features::jsonb->>'crowdLevel')::text, v_submission.crowd_level),
        COALESCE((v_submission.sensory_features::jsonb->>'densityLevel')::text, 'moderate'),
        COALESCE((v_submission.sensory_features::jsonb->>'wheelchairAccessible')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'accessibleParking')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'accessibleRestroom')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'quietSpaceAvailable')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'sensoryFriendlyHours')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'headphonesAllowed')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'staffTrained')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'sensoryFriendlyService')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'quietCryRoom')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'flexibleSeating')::boolean, false),
        COALESCE((v_submission.sensory_features::jsonb->>'sensoryKits')::boolean, false),
        v_hero_image,
        v_submission.images,
        v_submission.organizer_id,
        v_submission.id,
        NOW()
      )
      RETURNING id INTO v_entity_id;

    ELSE
      RAISE EXCEPTION 'Unknown submission type: %', v_submission.type;
  END CASE;

  -- Update submission status
  UPDATE listings
  SET
    status = 'approved',
    approved_entity_id = v_entity_id,
    reviewed_at = NOW(),
    reviewed_by = reviewer_id
  WHERE id = submission_id;

  RETURN v_entity_id;
END;
$$;

COMMENT ON FUNCTION approve_submission IS 'Promotes a pending submission to its final table with proper field mapping including sensory/accessibility data';
