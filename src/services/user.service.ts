import { myDataSource } from "../config/data_base";
import { User } from "../models/user.detail.model";
import { Forget_password } from "../models/forget.password.model";
import bcrypt from 'bcrypt';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import otp_gen from 'otp-generator';
import moment from 'moment';
import nodemailer from 'nodemailer';
import { Request } from "express";



const user_repos = myDataSource.getRepository<User>(User);
const forget_pass = myDataSource.getRepository<Forget_password>(Forget_password);

const jwt = jsonwebtoken;
dotenv.config({path : process.cwd()+'/.env'})



export const regist_user = async(data:{name: string, email: string, password: string, phone: string}) =>{
    
    const {name,email,password,phone} = data

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password,salt);

    const result = user_repos.create({
        name : name,
        email : email,
        password : hashedpassword,
        phonenumber : phone
    })

    await user_repos.save(result);

    const response = {
        name : name,
        email : email,
        phonenumber : phone
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
            return {'token':access_token, 'name':user_found.name, 'email':email, 'phonenumber':user_found.phonenumber};
        }
        return { 'message' : 'Invalid Password'};
    }
    return {'message' : 'user not found'};
}


export const forgot_password = async(email:string)=>{
    const user_found = await user_repos.findOneBy({email});
    if(user_found){

        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : process.env.EMAIL,
                pass : process.env.PASSWD
            }
        })

        let date = new Date();
        const exp_min = 1;
        const expires_at = moment(date.getTime()).add(exp_min,'minutes').toString();

        let otp_code = otp_gen.generate(4,{lowerCaseAlphabets:false, upperCaseAlphabets:false, specialChars:false});

        const message = {
            from : process.env.EMAIL,
            to : user_found.email,
            subject : 'Reset Your Password',
            html : `<h1>Rent-Reporting</h1>
                    <h3>OTP-Details</h3>
                    <h4><b>One Time Password(OTP):${otp_code}</b></h4>`
        }

        const sentMail = await transporter.sendMail(message);

        const del_record = await forget_pass.delete({email});

        const result = forget_pass.create({
            email:email,
            expiresat:expires_at,
            otp : otp_code
        })

        await forget_pass.save(result);

        return 'Email sent';
    }    
    return 'User Not Found!';   
};


export const otp_verify = async (req:Request,otp:string,password:string)=>{
        const bearer_token = req.headers["authorization"];
        const token = bearer_token!.split(" ")[1];
        const data =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
        if(data){
            const email = data.Data;
            const user_found = await forget_pass.findOneBy({email});
            if(user_found){
                if(user_found.otp === otp){
                    let hashedpassword = await bcrypt.hash(password,10);
                    await user_repos.update({email},{password:hashedpassword});
                    return 'Password Updated';
                }
                return 'Invalid OTP';
            }
            return 'Invalid User';
        }
        return 'Invalid User'; 
};


export const get_json_1 = async () => {
    let date = new Date();
    let month = date.getMonth()+1;
    console.log(month);
    
    let year = date.getFullYear();
    let start_date = 1;
    let end_date;

    if(month==2){
        if(moment().isLeapYear()){
            end_date = 29;
        }
        else{
            end_date = 28;
        }
    }
    else if(month == 4 || month == 6 || month == 9 || month == 11){
        end_date = 30;
    }
    else{
        end_date = 31;
    }

    function randomDate(start:Date,end:Date) {
        return new Date((start.getTime()+Math.random()*(end.getTime()-start.getTime()))).toISOString().slice(0,10);
    }

    const category = ['rent', 'petrol', 'grocories', 'entertainment', 'medical'];
    const trans_name = ['bhim','paytm','phonepe','gpay'];
    const json_data = []; 

    for(let i = 0; i<200; i++){

        json_data[i] = {
            trans_id : i+1, 
            trans_name : trans_name[Math.floor(Math.random()*trans_name.length)],
            date : randomDate(new Date(year,month-1,start_date), new Date(year,month-1,end_date)),
            amount: (Math.random()*5000 + 1).toFixed(2),
            category: category[Math.floor(Math.random()*category.length)]
        }
    }
    return json_data;
}

















