import { Entity, PrimaryKey, Property } from "@mikro-orm/core"
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    @Field()
    @PrimaryKey()
    id!: number

    @Field(() => String)
    @Property({ type: 'date', default: 'NOW()', onUpdate: () => new Date() })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: 'date', default: 'NOW()' })
    updatedAt = new Date()

    @Field(() => String)
    @Property({ type: 'text' })
    title!: string;
}