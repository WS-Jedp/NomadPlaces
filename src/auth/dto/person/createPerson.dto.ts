import { OmitType } from '@nestjs/mapped-types'
import { PersonDTO } from './person.dto'

class CreatePersonDTO extends OmitType(PersonDTO, ['id'] as const) {}

export {
    CreatePersonDTO,
}
