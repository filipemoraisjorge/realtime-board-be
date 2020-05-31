import {Mutation, Query, Resolver} from "type-graphql";
import {User} from "./User";
import {Service} from "typedi";
import {UserService} from "./User.service";
import {UUID} from "../Types/uuid.type";

@Service()
@Resolver(of => User)
export default class UserResolver {

    constructor(
        private readonly userService: UserService,
    ) {}

    @Mutation()
    createUser(): User {
        const user = new User();
        this.userService.set(user);
        return user;
    }

    @Query(type => User)
    getUser(userId: UUID): User | undefined {
        return this.userService.get(userId);
    }

    @Query(type => [User])
    getUsers(): User[] {
        return this.userService.getAll();
    }
}
