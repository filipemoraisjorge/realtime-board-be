import {Field, ID, ObjectType, Publisher} from "type-graphql";
import {User} from '../User/User';
import {newUUID, UUID} from "../Types/uuid.type";

@ObjectType()
export default class Board {

    @Field(type => ID)
    id: UUID;

    private _boardUsersIds: Set<UUID>;
    get userIds(): UUID[] {
        return Array.from(this._boardUsersIds.values());
    }

    shouldPublish: boolean = false;

    private intervalId?: NodeJS.Timeout;

    constructor() {
        this.id = newUUID();
        this._boardUsersIds = new Set<UUID>()
    }

    public hasUser(userId: UUID): boolean {
        return this._boardUsersIds.has(userId);
    }

    public startBoardStream(publish: Publisher<User[]>, populateUsers: (userIds: UUID[]) => User[] ) {
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
