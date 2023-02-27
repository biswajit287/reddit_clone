import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";

const main = async () => {
    const orm = await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig);
    await orm.getMigrator().up();
    // const post = orm.em.create(Post, { title: 'my first post 3', createdAt: new Date(), updatedAt: new Date() });
    // await orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {});
    // console.log('posts:: ', posts);

    const app = express();
    
    app.set("trust proxy", !__prod__);
    app.set("Access-Control-Allow-Origin", "https://studio.apollographql.com");
    app.set("Access-Control-Allow-Credentials", true);

    const RedisStore = connectRedis(session)
    const redis = new Redis('127.0.0.1:6379');

    const cors = {
      credentials: true,
      origin: "https://studio.apollographql.com",
    };

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redis,
                disableTouch: true,
                disableTTL: false,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
                httpOnly: true,
                secure: !__prod__,
                sameSite: 'none'
            },
            saveUninitialized: false,
            secret: "abcdefgh",
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}) => ({ em: orm.em, req, res }),
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app, cors });
    // app.get('/', (_, res) => {
    //     console.log(' hello from express server');
    //    res.send('hello from express');
    // })

    app.listen(4000, () => {
        console.log('server started on localhost:4000');

    })

}

main();