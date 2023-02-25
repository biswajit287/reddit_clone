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

const main = async () => {
    const orm = await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig);
    await orm.getMigrator().up();
    // const post = orm.em.create(Post, { title: 'my first post 3', createdAt: new Date(), updatedAt: new Date() });
    // await orm.em.persistAndFlush(post);

    // const posts = await orm.em.find(Post, {});
    // console.log('posts:: ', posts);

    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false,
        }),
        context: () => ({em: orm.em}),
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({app});
    // app.get('/', (_, res) => {
    //     console.log(' hello from express server');
    //    res.send('hello from express');
    // })

    app.listen(4000, () => {
        console.log('server started on localhost:4000');

    })

}

main();