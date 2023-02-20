import { Options } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import  path  from "path";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pathTs: 'src/migrations',
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post],
    allowGlobalContext: true,
    dbName: 'lireddit',
    type: "postgresql",
    user: "postgres",
    password: "postgres",
    debug: !__prod__
} as Options<PostgreSqlDriver>