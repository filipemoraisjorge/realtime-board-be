import {
    Arg,
    Mutation,
    Publisher,
    Query,
    Resolver,
    Root,
    Subscription,
    PubSub, FieldResolver
} from "type-graphql";
import Point, {PointInput} from "../Point/Point";
import Board from "./Board";
import {User} from "../User/User";
import {UserService} from "../User/User.service";
import {Service} from "typedi";
import {BoardService} from "./Board.service";

@Service()
@Resolver(of => Board)
export class BoardResolver {

    constructor(
        private readonly userService: UserService,
        private readonly boardService: BoardService,
    ) {}

    private populateUsers() {
        return (userIds: string[]) => this.populateUsersWithUserService(userIds);
    }

    private populateUsersWithUserService(userIds: string[]): User[] {
        return userIds.map(userId => this.userService.get(userId));
    }

    @FieldResolver(returns => [User])
    users(@Root() board: Board): User[] {
        return this.populateUsers()(board.userIds);
    }

    @Query(returns => Board, {nullable: true})
    getBoard(@Arg("boardId") boardId: string): Board | undefined {
        return this.boardService.get(boardId);
    }

    @Query(returns => [Board])
    getBoards(): Board[] {
        return this.boardService.getAll();
    }

    @Query(returns => [User], {nullable: true})
    getBoardUsers(@Arg("boardId") boardId: string): User[] | undefined {
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
        @Arg("boardId") boardId: string,
        @Arg("userId") userId: string,
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
    joinBoard(
        @Arg("boardId") boardId: string,
        @Arg("userId") userId: string,
    ): boolean {
        const board = this.getBoard(boardId);
        const user = this.userService.get(userId);
        return !!board && !!user && board.addUser(user);
    }

    @Mutation(returns => Boolean, {nullable: true})
    exitBoard(
        @Arg("boardId") boardId: string,
        @Arg("userId") userId: string,
    ): boolean {
        const board = this.getBoard(boardId);
        const user = this.userService.get(userId);
        return !!board && !!user && board.removeUser(user);
    }

    @Subscription(returns => [User], {topics: "BOARD"})
    newUserPoints(@Root() userPointsPayload: User[]): User[] {
        return userPointsPayload;
    }

}

