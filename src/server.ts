import "reflect-metadata";
import {buildSchema} from "type-graphql";
import {ApolloServer} from "apollo-server";
import { Container } from "typedi";

const PORT = process.env.PORT || 4000;

// put sample recipes in container
Container.set({ id: "USERS", factory: () => new Map() });

async function bootstrap() {

    const schema = await buildSchema({
        resolvers: [__dirname + "/modules/**/*.resolver.{ts,js}", __dirname + "/resolvers/**/*.{ts,js}"],
        container: Container,
        validate: false
    });

    // Create the GraphQL server
    const server = new ApolloServer({
        schema,
        subscriptions: {
            path: "/subscriptions",
            // other options and hooks, like `onConnect`
        },
        playground: true,
    });

    // Start the server
    const { url } = await server.listen(PORT);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
