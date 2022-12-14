import Joi from "joi"
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from 'bcrypt'
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const registerController={
   async register(req,res,next){
        //validate the request
        //authorize the request
        //check if user is in the databasee already
        //prepare model
        //store in database
        //generate jwt token
        //send response
        //express validator
    console.log(req.body)
        const registerScehma=Joi.object({
            name:Joi.string().min(3).max(30).required(),
            email:Joi.string().email().required(),
            password:Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            
            repeat_password :Joi.ref('password')
        })
    
        const {error}=registerScehma.validate(req.body);

        if(error){
            console.log(error)
            return next(error);//middleware will always catch the error
        }

        //check if the user is in the database

        try {
            const exist=await User.exists({email:req.body.email})

            if(exist){
                return next(CustomErrorHandler.alreadyExist('This email is already taken.'))
            }
        }catch(err)
        {
            return next(err)
        }
        const {name,email,password}=req.body;
        console.log(req.body)
        // hash-password
        const hashedPassword=await bcrypt.hash(password,10);

       
        //prepare the model
        const user=new User({
            name:name,
            email:email,
            password:hashedPassword
        })

        let access_token;
        let refresh_token;
        try{
            const result=await user.save();
            console.log(result)

            //Token
            access_token=JwtService.sign({_id:result._id,role:result.role})

            refresh_token=JwtService.sign({_id:result._id,role:result.role},'1y',REFRESH_SECRET);

            //database whitelist
            await RefreshToken.create({token:refresh_token})

        }catch(err){
            return next(err);
        }

        res.json({access_token,refresh_token})
    }
}

export default registerController