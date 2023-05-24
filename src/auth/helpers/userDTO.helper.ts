import { People, User } from "@prisma/client";
import { UserDTO } from "../dto/user/user.dto";
import { PersonDTOHelper } from "./personDTO.helper";

export class UserDTOHelper {
    public static fromEntityToDTO(user: User, withPerson?: People): UserDTO {
        const userDTO = {
            id: user.id,
            username: user.username,
            email: user.email,
            personID: user.personID,
            profilePicture: user.profilePicture,
            createdDate: user.createdDate,
            person: withPerson ? PersonDTOHelper.fromEntityToDTO(withPerson) : undefined,
        };
        return userDTO;
    }
}