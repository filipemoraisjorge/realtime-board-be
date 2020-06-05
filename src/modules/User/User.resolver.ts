import {Arg, ID, Mutation, Publisher, PubSub, Query, Resolver, Root, Subscription} from "type-graphql";
import {User} from "./User";
import {Service} from "typedi";
import {UserService} from "./User.service";
import {UUID} from "../Types/uuid.type";
import {PointInput} from "../Point/Point";

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
    getUser(@Arg("userId", type => ID) userId: UUID): User {
        return this.userService.get(userId);
    }

    @Query(type => [User])
    getUsers(): User[] {
        return this.userService.getAll();
    }

    @Mutation(returns => User, {nullable: true})
    updatePoint(
        @Arg("userId") userId: UUID,
        @Arg("point") point: PointInput,
        @PubSub("USER_POINT") publish: Publisher<User>
    ): User {
        const user = this.userService.get(userId);
        if (user) {
            user.setPoint(point);
            // @ts-ignore
            throttle(publish, 1000/60)(user)
        }
        return user;
    }

    @Subscription(returns => User, {
        topics: "USER_POINT",
        filter: ({payload, args}) => payload.id === args.userId
    })
    newUserPoint(
        @Root() userPayload: User,
        @Arg('userId', returns => ID) userId: string
    ): User {
        return userPayload;
    }

}

let inThrottle: boolean;
// @ts-ignore
const throttle = (func, limit: number) => {
    return function () {
        const args = arguments;
        // @ts-ignore
        const context: unknown = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit)
        }
    }
};
