import { Injectable } from '@nestjs/common';
import { Coordinates, DISTANCE_UNIT } from '../types';

@Injectable()
export class DistanceService {

    private RADIUS = {
        [DISTANCE_UNIT.KM]: 6371
    }

    private RADIAN_VALUE = 180

    numberToRadian(number: number) {
        return number * Math.PI / this.RADIAN_VALUE
    }

    getDistance(firstLocation: Coordinates, secondLocation: Coordinates, unit: DISTANCE_UNIT = DISTANCE_UNIT.KM) {
        const RADIUS = this.RADIUS[unit]

        const x1 = secondLocation.latitude - firstLocation.latitude
        const dLat = this.numberToRadian(x1)
        const x2 = secondLocation.longitude - firstLocation.longitude
        const dLon = this.numberToRadian(x2)

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(this.numberToRadian(firstLocation.latitude) * Math.cos(this.numberToRadian(secondLocation.latitude))) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2)

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = RADIUS * c
        
        return distance
    }
    
}
