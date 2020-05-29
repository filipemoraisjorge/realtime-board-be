import {Service, Inject} from "typedi";
import {User} from "./User";

@Service()
export class UserService {
    @Inject("USERS")
    private readonly items: Map<string, User> = new Map();

    getAll(): User[] {
        return Array.from(this.items.values());
    }

    getOne(id: string): User | undefined {
        return this.items.get(id);
    }

    set(user: User): void {
        this.items.set(user.id, user);
    }

    remove(user: User): boolean {
        return this.items.delete(user.id);
    }
}
