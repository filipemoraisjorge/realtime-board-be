import {
    Arg,
    Args,
    FieldResolver,
    ID,
    Mutation,
    Publisher,
    PubSub,
    Query,
    Resolver,
    Root,
    Subscription
} from "type-graphql";
import {PointInput} from "../Point/Point";
import Board from "./Board";
import {User} from "../User/User";
import {UserService} from "../User/User.service";
import {Service} from "typedi";
import {BoardService} from "./Board.service";
import {UUID} from "../Types/uuid.type";
import {UserBoardConnectArgs, UserBoardConnectE, UserBoardPayload} from "./Board.types";

@Service()
@Resolver(of => Board)
export class BoardResolver {

    constructor(
        private readonly userService: UserService,
        private readonly boardService: BoardService,
    ) {}

    private populateUsers() {
        return (userIds: UUID[]) => this.populateUsersWithUserService(userIds);
    }

    private populateUsersWithUserService(userIds: UUID[]): User[] {
        return userIds.map(userId => this.userService.get(userId));
    }

    @FieldResolver(returns => [User])
    users(@Root() board: Board): User[] {
        return this.populateUsers()(board.userIds);
    }

    @Query(returns => Board, {nullable: true})
    getBoard(@Arg("boardId") boardId: UUID): Board {
        return this.boardService.get(boardId);
    }

    @Query(returns => [Board])
    getBoards(): Board[] {
        return this.boardService.getAll();
    }

    @Query(returns => [User], {nullable: true})
    getBoardUsers(@Arg("boardId") boardId: UUID): User[] | undefined {
        const board = this.getBoard(boardId);
        if (board) {
            return this.populateUsers()(board.userIds);
        } else {
            return;
        }
    }

    @Mutation()
    createBoard(
        @PubSub("BOARD") publish: Publisher<User[]>,
    ): Board {
        const board = new Board();
        this.boardService.set(board);
        board.startBoardStream(publish, this.populateUsers());
        return board;
    }

    @Mutation(returns => Board, {nullable: true})
    updateUserPoint(
        @Arg("boardId") boardId: UUID,
        @Arg("userId") userId: UUID,
        @Arg("point") point: PointInput
    ): Board | undefined {
        const board = this.getBoard(boardId);
        if (board) {
            if(board.hasUser(userId)) {
                const user = this.userService.get(userId);
                if (user) {
                    board.shouldPublish = user.setPoint(point);
                }
            }
        }
        return board;
    }

    @Mutation(returns => Boolean, {nullable: true})
    async userBoardConnect(
        @Args() {boardId, userId, connect}: UserBoardConnectArgs,
        @PubSub("USER_BOARD_CONNECT") publish: Publisher<UserBoardPayload>
    ): Promise<boolean> {
        const board = this.getBoard(boardId);
        const user = this.userService.get(userId);
        await publish({user, boardId: board.id, connect});
        return !!board && !!user &&
        connect === UserBoardConnectE.JOIN
            ? board.addUser(user)
            : board.removeUser(user);
    }

    @Subscription({
        topics: "USER_BOARD_CONNECT",
        filter: ({payload, args}) => payload.boardId === args.boardId
    })
    newUserBoardConnect(
        @Root() payload: UserBoardPayload,
        @Arg('boardId', returns => ID) userId: string
    ): UserBoardPayload {
        return payload;
    }
}
