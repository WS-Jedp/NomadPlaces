import { Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { PlaceMongoEntity } from 'src/global/entities/place';
import Response from 'src/global/models/response';
import { PlaceEntityHelper } from 'src/places/helpers/PlaceHelper.dto';
import { PlacesService } from 'src/places/services/places/places.service';
@Controller('places')
export class PlacesController {

    constructor(
        private placesService: PlacesService
    ) {}

    /**
     * CREATE ACTIONS
     * All the actions that involve the action of reading
     */
    @Post('add')
    async addNewPlace() {
        // Handling adding a new place into the database
    }

    /**
     * READ ACTIONS
     * All the actions that involve the action of reading
     */

    @Get('near')
    async getNearToMe(@Query() searchData: { latitude: number, longitude: number, maxDistance?: number, minDistance?: number }) {
        const { latitude, longitude, maxDistance = 500, minDistance = 10 } = searchData
        return new Response({
            content: await this.placesService.getNearestPlacesToLocation(maxDistance, minDistance, { latitude, longitude }),
            status: HttpStatus.OK
        })
    }

    @Get('detail/:id')
    async getDetail(@Param('id') id: string) {
        // Get the detail information about the place
            // Place Session
            // Place main reviews
            // Place guides
        const currentPlace = await this.placesService.getPlace(id)
        return new Response({
            content: currentPlace,
            status: HttpStatus.OK
        })
    } 

    @Get()
    async getAll() {
       return new Response({
        content: await this.placesService.getAll(),
        status: HttpStatus.OK
       })
    }

    /**
     * UPDATE ACTIONS
     * All the actions that involve the action of updating
     */

    @Post('/update/:id')
    async updatePlace(@Param('id') id: string) {
        // Handling updating a place from the database
    }

    @Post('/hide/:id')
    async hidePlace(@Param('id') id: string) {
        // Hide a place to not be shown to the public
    }


    /**
     * DELETE ACTIONS
     * All the actions that involve the action of updating
     */

    @Post('/delete/:id')
    async delete(@Param('id') id: string) {
        // Handling deleting a place from the database
    }
}
