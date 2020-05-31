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

    private _boardUsersIds: Set<string>;
    get userIds(): string[] {
        return Array.from(this._boardUsersIds.values());
    }

    shouldPublish: boolean = false;

    private intervalId?: NodeJS.Timeout;

    constructor() {
        this.id = uuid();
        this._boardUsersIds = new Set<string>()
    }

    public hasUser(userId: string): boolean {
        return this._boardUsersIds.has(userId);
    }

    public startBoardStream(publish: Publisher<User[]>, populateUsers: (userIds: string[]) => User[] ) {
        //•	Every 1000/60 = 16ms sends Users to each User in Users
        const frameRate = 18;
        this.intervalId = setInterval(async () => {
            if (this.shouldPublish) {
                const payload: User[] = populateUsers(this.userIds);
                await publish(payload || []);
                this.shouldPublish = false;
            }
        }, 1000 / frameRate)
    }

    public addUser(user: User): boolean {
        return !!(user && this._boardUsersIds.add(user.id));
    }

    public removeUser(user: User): boolean {
        return user && this._boardUsersIds.delete(user.id);
    }
}
