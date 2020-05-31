// @ts-ignore
import stringToColor from 'string-to-color';
import Point from "../Point/Point";
import {Field, ID, ObjectType} from "type-graphql";
import {newUUID, UUID} from "../Types/uuid.type";

@ObjectType()
export class User {
    @Field(type => ID)
    id: UUID;

    @Field()
    point: Point;

    @Field()
    color: string;

    constructor(point?: Point) {
        this.id = newUUID();
        this.point = point || new Point();
        this.color = stringToColor(this.id)
    }

    setPoint(newPoint: Point): boolean {
        if (this.point.isDifferent(newPoint)) {
            this.point = newPoint;
            return true;
        } else {
            return false
        }
    }

}
