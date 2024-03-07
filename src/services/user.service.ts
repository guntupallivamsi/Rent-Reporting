import { myDataSource } from "../config/data_base";
import { User } from "../models/user.detail.model";
import { Forget_password } from "../models/forget.password.model";
import bcrypt from 'bcrypt';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import otp_gen from 'otp-generator';
import moment, { months } from 'moment';
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
}
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


function randomDate (year:number,month:number) {
    const days = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
    const randomday = Math.floor(Math.random()*days+1);
    return moment(new Date(`${year}-${month}-${randomday}`)).format('YYYY-MM-DD').slice(0,10);
}


const category = ['rent', 'petrol', 'grocories', 'entertainment', 'medical'];


function get_json_data(overall_month:string,iter:number,records:number) {

    let m = overall_month.slice(5,7);
    let year = overall_month.slice(0,4);
    
    const json_data = [];
    
        for(let cnt = 0; cnt<iter; cnt++) {
            
                for(let i = 0; i<records;)
                {
                    let rand_num = Math.floor(Math.random()*11);
                    
                    if(rand_num!=0){
                        var date;       
                        date =  randomDate(parseInt(year), parseInt(m));
                    }

                    for(let trans = 0; trans<rand_num && i<records; trans++)
                    {

                        let trans_name = "";

                        for(let len = 0; len<12; len++){
                            trans_name += Math.floor(Math.random()*10)
                        }

                        json_data.push({
                            trans_id : i+1,
                            trans_name : trans_name, 
                            trans_date : date,
                            amount: (Math.random()*5000 + 1).toFixed(2),
                            category: category[Math.floor(Math.random()*category.length)]
                        });
                        i+=1;
                    }
                }
                let new_month = moment(`${year}-${m}`).add(1,'month').format('YYYY-MM');
                year = new_month.slice(0,4);
                m = new_month.slice(5,7);
            }
            return json_data;
}

let current_month = moment().format('YYYY-MM');

export const get_json_1 = async () => {
    const data = await get_json_data(current_month,1,200);
    return data;
}


let json2_month = moment(current_month).add(1,'month').format('YYYY-MM');

export const get_json_2 = async () => {
    const data = await get_json_data(json2_month,3,166);
    return data;
}


let json3_month = moment(json2_month).add(3,'month').format('YYYY-MM')

export const get_json_3 = async () => {
    const data = await get_json_data(json3_month,3,166);
    return data;
}


export const get_json_4 = async () => {
    const json4 = [];
    for(let i = 0; i<24; i++) {
        const data = await get_json_data(moment(current_month).subtract(i,'month').format('YYYY-MM'), 1, Math.floor(Math.random()*301+1));
        json4[i] = data;
    }
    return json4;
}



                   


