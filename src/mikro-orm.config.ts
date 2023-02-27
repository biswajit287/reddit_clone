import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import  path  from "path";
import { User } from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pathTs: 'src/migrations',
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post, User],
    allowGlobalContext: true,
    dbName: 'lireddit',
    type: "postgresql",
    user: "postgres",
    password: "postgres",
    debug: !__prod__
} as Options<PostgreSqlDriver>