import {v4 as uuid} from 'uuid';
import Point from '../Point/Point';
import {Field, ID, ObjectType, PubSub, Publisher} from "type-graphql";
import {User} from '../User/User';
import UserResolver from '../User/User.resolver';
import {Service} from "typedi";
import {UserService} from "../User/User.service";

@ObjectType()
export default class Board {

    @Field(type => ID)
    id: string;

    usersCollection: Map<string, User>;
    shouldPublish: boolean = false;

    private intervalId?: NodeJS.Timeout;

    constructor() {
        this.id = uuid();
        this.usersCollection = new Map<string, User>()
    }


    @Field(type => [User])
    users(): User[] {
        return Array.from(this.usersCollection.values());
    }

    public startBoardStream(publish: Publisher<User[]>) {
        //•	Every 1000/60 = 16ms sends Users to each User in Users
        const frameRate = 18;
        this.intervalId = setInterval(async () => {
            if (this.shouldPublish) {
                const payload: User[] = this.users();
                await publish(payload || []);
                this.shouldPublish = false;
            }
        }, 1000 / frameRate)
    }

    public updateUserPoint(userId: string, point: Point): void {
        const user = this.usersCollection.get(userId);
        if (user) {
            this.shouldPublish = user.setPoint(point);
            this.usersCollection.set(userId, user);
        }
    }

    public addUser(user: User): boolean {
        return !!(user && this.usersCollection.set(user.id, user));
    }

    public removeUser(user: User): boolean {
        return user && this.usersCollection.delete(user.id);
    }
}
