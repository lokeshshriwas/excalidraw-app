import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prismaClient } from "@repo/db"
import {CreateUserSchema, SigninSchema} from "@repo/common"
import {JWT_SECRET} from "@repo/backend-common/config"

export const signupController = async (req: any, res: any) => {
    const result = CreateUserSchema.safeParse(req.body);
    
    if (!result.success) {
        return res.status(400).send({ 
            error: "Invalid input", 
            details: result.error.errors 
        });
    }
    
    try {
        const { email, name, password } = result.data;

        const existingUser = await prismaClient.user.findFirst({
            where: {
                email
            }
        });
        
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        
        const user = await prismaClient.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });
        
        return res.status(201).send(user);
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).send({message :"Internal server error"});
    }
};

export const signinController = async (req : any, res : any) => {
    const result = SigninSchema.safeParse(req.body);
    
    if (!result.success) {
        return res.status(400).send({ 
            error: "Invalid input", 
            details: result.error.errors 
        });
    }

    const { email, password } = result.data;

    const userData = await prismaClient.user.findFirst({
        where: {
            email
        }
    })

    if (!userData) {
        return res.status(400).send({message: "User not found"});
    }

    const isPasswordValid = bcrypt.compareSync(password, userData.password);

    if (!isPasswordValid) {
        return res.status(400).send({message: "Invalid password"});
    }
    if (JWT_SECRET === undefined) {
        throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userId: userData.id }, JWT_SECRET);
    return res.status(200).send({ token : token, message: "Login successful" });
}