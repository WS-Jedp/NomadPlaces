import { PartialType } from "@nestjs/mapped-types";
import { CreatePlaceDTO } from "./CreatePlace.dto";

class UpdatePlaceDTO extends PartialType(
    CreatePlaceDTO
) {}

export {
    UpdatePlaceDTO
}