import jwt, { JwtPayload } from "jsonwebtoken"

export const middleware = async (req : any, res : any, next : any) => {
    const token = req.headers.authorization

    const decoded = jwt.decode(token);

    if(decoded){
        req.userId = (decoded as JwtPayload).userId;;
        next();
    } else{
        return res.status(401).send({message: "Unauthorized"});
    }
}