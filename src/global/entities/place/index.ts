import {
  AMBIENCE_TAG_ENUM,
  Commodities,
  LANGUAGE_ENUM,
  MULTIMEDIA_TYPE_ENUM,
  PLACE_APPROXIMATE_DAILY_CONST_ENUM,
  PlaceConfirmationStatus,
  PlaceRules,
  Places,
  PlaceTypes,
  THEME_TAG_ENUM,
} from '@prisma/client';

type PlaceMongoEntity = {
  _id: {
    $oid: string;
  };
  placeID: string;
  confirmedByID: string;
  name: string;
  knownFor: string | null;
  description: string | null;
  confirmationStatus: PlaceConfirmationStatus;
  type: PlaceTypes[];
  capacity?: number;
  languages: LANGUAGE_ENUM[];
  ambianceTags: AMBIENCE_TAG_ENUM[];
  themeTags: THEME_TAG_ENUM[];
  approximateDailyCost: PLACE_APPROXIMATE_DAILY_CONST_ENUM | null;
  discoveredDate?: { $date: Date };
  rejectedDate?: { $date: Date };
  approvedDate?: { $date: Date };
  discoveredByID?: { $oid: string };
  confirmedByIDs?: { $oid: string }[];
  visitedByIDs?: { $oid: string }[];
  location: {
    latitude: number; longitude: number; zone: string; city: string; country: string;
  };
  commodities: Commodities;
  multimedia: { url: string; type: MULTIMEDIA_TYPE_ENUM; createdDate: Date }[];
  rules: PlaceRules;
};

export { PlaceMongoEntity };
