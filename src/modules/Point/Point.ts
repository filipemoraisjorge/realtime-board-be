import {Field, InputType, ObjectType} from "type-graphql";

@ObjectType()
export default class Point {
    @Field({ nullable: true })
    x?: number;
    @Field({ nullable: true })
    y?: number;

    constructor(x?: number, y?:number ) {
        this.x = x;
        this.y = y;
    }

    isDifferent({x,y}: Point): boolean {
        return this.x !== x && this.y !== y;
    }
}

@InputType()
export class PointInput extends Point {
    @Field({ nullable: true })
    x?: number;
    @Field({ nullable: true })
    y?: number;
}
