import { json } from "stream/consumers";
import { myDataSource } from "../config/data_base";
import { User } from "../models/user.detail.model";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

const dotenv = require('dotenv');
const jwt = jsonwebtoken;


const user_repos = myDataSource.getRepository<User>(User);
dotenv.config({path : process.cwd()+'/.env'})


export const regist_user = async(data:{name: string, email: string, password: string, phonenumber: string}) =>{
    
    const {name,email,password,phonenumber} = data

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password,salt);

    const result = user_repos.create({
        name : name,
        email : email,
        password : hashedpassword,
        phonenumber : phonenumber
    })

    await user_repos.save(result);

    const response = {
        name : name,
        email : email,
        phonenumber : phonenumber
    };

    return response;
}


export const user_login = async (data:{email:string, password:string}) => {
    const {email,password} = data;
    const user_found = await user_repos.findOneBy({email});
    if(user_found){
        const check_passwd = await bcrypt.compare(password,user_found.password);
        if(check_passwd){
            const access_token = jwt.sign({Data:email},process.env.ACCESS_TOKEN_SECRET!);
            return {'status':200,'token':access_token, 'name':user_found.name, 'email':email, 'phonenumber':user_found.phonenumber};
        }
        return {'status': 401, 'message' : 'Invalid Password'};
    }
    return {'status':404,'message' : 'user not found'};
}