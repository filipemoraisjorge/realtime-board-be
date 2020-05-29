import {v4 as uuid} from 'uuid';
// @ts-ignore
import stringToColor from 'string-to-color';
import Point from "../Point/Point";
import {Field, ID, ObjectType} from "type-graphql";

@ObjectType()
export class User {
    @Field(type => ID)
    id: string;

    @Field()
    point: Point;

    @Field()
    color: string;

    constructor(point?: Point) {
        this.id = uuid() ;
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
