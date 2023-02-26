import { Controller, Get, Param, Post, Query } from '@nestjs/common';
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
        const nearPlaces = await this.placesService.findNearestToLocation(maxDistance, minDistance, { latitude, longitude })
        return nearPlaces
    }

    @Get('detail/:id')
    async getDetail(@Param('id') id: string) {
        // Get the detail information about the place
            // Place Session
            // Place main reviews
            // Place guides
        const currentPlace = await this.placesService.findOne(id)
        return currentPlace
    } 

    @Get()
    async getAll() {
       return await this.placesService.getAll()
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
