import {Service, Inject} from "typedi";
import {User} from "./User";
import Serviceable from "../Types/service.interface";
import {UUID} from "../Types/uuid.type";

@Service()
export class UserService implements Serviceable<User> {
    @Inject("USERS")
    private readonly items: Map<UUID, User> = new Map();

    getAll(): User[] {
        return Array.from(this.items.values());
    }

    get(id: UUID): User {
        const user = this.items.get(id);
        if (user === undefined) {
            throw 'User.service>get: User not found'
        }
        return user;
    }

    set(user: User): void {
        this.items.set(user.id, user);
    }

    remove(user: User): boolean {
        return this.items.delete(user.id);
    }
}
