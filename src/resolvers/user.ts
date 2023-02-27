import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";

@InputType()
class UserPayload implements Partial<User> {
    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@Resolver()
export class UserResolver {

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: MyContext
    ) {
        // console.log('session:: ', req.session);
        if (!req.session.userId) {
            return null;
        }
        const user = await em.findOne(User, { id: parseInt(req.session.userId) });
        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("payload") payload: UserPayload,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (payload.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'length must be greater then 2',
                    }
                ]
            }
        }

        if (payload.password.length <= 3) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'length must be greater then 3',
                    }
                ]
            }
        }

        if (await em.findOne(User, { username: payload.username })) {
            // console.log('inside already taken');

            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username already taken',
                    }
                ]
            }
        }

        const hashedPassword = await argon2.hash(payload.password);
        const user = em.create(User, {
            username: payload.username,
            createdAt: new Date(),
            updatedAt: new Date(),
            password: hashedPassword,
        });

        await em.persistAndFlush(user);
        // login user after registration
        //sets cockie in browser to keep the user session
        req.session.userId = user.id.toString();

        return { user };
    }


    @Mutation(() => UserResponse)
    async login(
        @Arg("payload") payload: UserPayload,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: payload.username });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'User does not exist!'
                    }
                ]
            }
        }

        const validPassword = await argon2.verify(user.password, payload.password);
        if (!validPassword) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Incorrect Password'
                    }
                ]
            }
        }

        req.session.userId = user.id.toString();

        return {
            user
        }
    }

}