import { People } from "@prisma/client";
import { CreatePersonDTO } from "../dto/person/createPerson.dto";
import { PersonDTO } from "../dto/person/person.dto";

class PersonDTOHelper {
    public static fromDTOtoEntity(personDTO: CreatePersonDTO): Omit<People, 'id'> {
        return {
            firstName: personDTO.firstName,
            lastName: personDTO.lastName || null,
            birthdate: new Date(personDTO.birthdate) || null,
            about: personDTO.about || null,
            country: personDTO.country || null,
            job: personDTO.job || null,
            languages: personDTO.languages || null,
        }
    }

    public static fromEntityToDTO(personEntity: People): PersonDTO {
        return {
            id: personEntity.id,
            firstName: personEntity.firstName,
            lastName: personEntity.lastName || null,
            birthdate: personEntity.birthdate.toISOString() || null,
            about: personEntity.about || null,
            country: personEntity.country || null,
            job: personEntity.job || null,
            languages: personEntity.languages || null,
        }
    }
}

export {
    PersonDTOHelper
}