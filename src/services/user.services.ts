import { json } from "stream/consumers";
import { myDataSource } from "../config/data_base";
import { User } from "../models/user.detail.model";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


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