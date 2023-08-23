import bcrypt from 'bcrypt';
import { Request, Response } from "express";
import { User } from "../Models/userModels";
import jwt, { Secret } from "jsonwebtoken";
interface SignupRequestBody {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber:string;
    address:string;
    isAdmin:boolean;
}

interface SignInRequestBody {
    email: string;
    password: string;
}
type Env = {
    PORT: string;
}
export const Signup = async (req: Request<{}, SignupRequestBody>, res: Response) => {
    // console.log(req.body);
    const { firstName, lastName, email, password,phoneNumber,address } = req.body;
    await User.find({ email })
        .then(result => {
            if (result.length > 0) {
                return res.status(409).json({
                    message: "User already exists",
                });
            }
            else {
                bcrypt.hash(password, 10, async (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            error: err,
                        });
                    }
                    else {
                        const user = new User({
                            firstName, lastName, email, password: result,phoneNumber,address
                        });
                        await user.save();
                        return res.status(201).json({
                            message: "User created"
                        });
                    }
                });
                return;
            }
        })
        .catch(error => {
            return res.status(500).json({
                message: "server error",
                error
            });
        });
};

export const Signin = async (req: Request<{}, SignInRequestBody>, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Username or Password is incorrect" });
        }
        let secret: Secret;
        if(!user.isAdmin){
             secret= process.env["JWT_USER_KEY" as keyof Env] || "default-secret";
        }
        else{
            secret= process.env["JWT_Admin_KEY" as keyof Env] || "default-admin-secret";
        }
        const token = jwt.sign({
            email: user.email,
            userId: user._id
        }, secret, { expiresIn: "1h" });
        return res.status(200).json({ message: "Signed In", token, userId: user._id,isAdmin:user.isAdmin });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}


export const GetUserDetials=async (req:Request,res:Response)=>{
    const {userId}=req.params;
    try{
        const user=await User.findById(userId).select("firstName lastName email phoneNumber address");
        if(user){
            return res.status(200).json({
                user,
                message:"User found"
            })
        }else{
            return res.status(500).json({
                message:"Something went wrong!",
            })
        }
    }
    catch(error){
        return res.status(500).json({
            message:"Something went wrong!",
            error
        })
    }
}
