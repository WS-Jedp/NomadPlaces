import { Places } from '@prisma/client';
import { PlaceMongoEntity } from 'src/global/entities/place';

class PlaceEntityHelper {
  protected placeMongoEntity: PlaceMongoEntity;

  public static MongoEntityToDTO(
    mongoEntity: PlaceMongoEntity,
  ): Places & {
    discoveredBy: { id: string; username: string; profilePicture?: string };
  } {
    return {
      id: mongoEntity._id.$oid,
      name: mongoEntity.name,
      capacity: mongoEntity.capacity,
      knownFor: mongoEntity.knownFor,
      description: mongoEntity.description,
      languages: mongoEntity.languages,
      approximateDailyCost: mongoEntity.approximateDailyCost,
      themeTags: mongoEntity.themeTags,
      ambianceTags: mongoEntity.ambianceTags,
      commodities: mongoEntity.commodities,
      location: mongoEntity.location,
      multimedia: mongoEntity.multimedia,
      rules: mongoEntity.rules,
      type: mongoEntity.type,
      approvedDate: mongoEntity.approvedDate?.$date || null,
      confirmationStatus: mongoEntity.confirmationStatus,
      confirmedByIDs: mongoEntity.confirmedByIDs?.map((id) => id.$oid) || [],
      discoveredByID: mongoEntity.discoveredByID?.$oid || null,
      discoveredBy: mongoEntity.discoveredBy || undefined,
      visitedByIDs: mongoEntity.visitedByIDs?.map((id) => id.$oid) || null,
      discoveredDate: mongoEntity.discoveredDate?.$date || null,
      rejectedDate: mongoEntity.rejectedDate?.$date || null,
    };
  }
}

export { PlaceEntityHelper };
