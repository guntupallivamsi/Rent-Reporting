import { myDataSource } from "../config/data_base";
import { User } from "../models/user.detail.model";
import { Forget_password } from "../models/forget.password.model";
import { Transaction } from "../models/trans.model";
import bcrypt from 'bcrypt';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import otp_gen from 'otp-generator';
import moment from 'moment';
import nodemailer from 'nodemailer';
import { Request } from "express";
import  stringComparision from 'string-comparison';
import { it } from "node:test";





const user_repos = myDataSource.getRepository<User>(User);
const forget_pass = myDataSource.getRepository<Forget_password>(Forget_password);
const trans = myDataSource.getRepository<Transaction>(Transaction);


const leven = stringComparision.levenshtein;
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
};


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
};


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
        const exp_min = 5;
        const expires_at = moment(date.toLocaleTimeString()).add(exp_min,'minutes').toString();

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


function randomDate (year:number,month:number) {
    const days = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
    const randomday = Math.floor(Math.random()*days+1);
    return new Date(moment(new Date(`${year}-${month}-${randomday}`)).format('YYYY-MM-DD').slice(0,10));
}


const category = ['rent', 'petrol', 'grocories', 'entertainment', 'medical'];


function get_json_data(overall_month:string, iter:number, records:number) {

    let m = overall_month.slice(5,7);
    let year = overall_month.slice(0,4);
    var date; 
    const json_data = [];
    
        for(let cnt = 0; cnt<iter; cnt++) {
            
                for(let i = 0; i<records;)
                {
                    let rand_num = Math.floor(Math.random()*11);
                    
                    if(rand_num!=0) {       
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
                            trans_date : date!,
                            amount: parseFloat((Math.random()*(5000-1000)+1000).toFixed(2)),
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
};


let current_month = moment().format('YYYY-MM');

export const get_json_1 = async () => {
    const data = await get_json_data(current_month,1,200);
    return data;
};


let json2_month = moment(current_month).add(1,'month').format('YYYY-MM');

export const get_json_2 = async () => {
    const data = await get_json_data(json2_month,3,166);
    return data;
};


let json3_month = moment(json2_month).add(3,'month').format('YYYY-MM')

export const get_json_3 = async () => {
    const data = await get_json_data(json3_month,3,166);
    return data;
};

export const get_json_4 = async () => {
    const json4 = [];
    for(let i = 0; i<24; i++) {
        json4[i] = await get_json_data(moment(current_month).subtract(i,'month').format('YYYY-MM'), 1, Math.floor(Math.random()*300+1));
    }
    return json4.flat();
};


export const get_transaction_details_1 = async() => {
    const json_data = await get_json_1();
    return json_data;
};


export const get_transaction_details_2 = async () => {
    const json_data = await get_json_2();
    return json_data;
};


export const post_transaction = async (req:{trans_name:string, trans_date:Date, amount:number, category:string, trans_id:number},user_id:number) => {
    
    const {trans_name, trans_date, amount, category, trans_id} = req;
  

    const user_found = await user_repos.findOneBy({id:user_id});

    if(!user_found){
        return 'Invalid user'
    }
    
    const result = trans.create({
        trans_id, trans_name, trans_date, amount, category, user:user_found
    })
    
    await trans.save(result);
    return result;
};


export const verify_transaction = async (req:{trans_id:number, trans_name:string, trans_date:Date, amount:number, category:string}, user_id:number) => {
    
    const {trans_id, trans_name, trans_date, amount, category} = req;

    const data1 = await get_json_1();
    const data2 = await get_json_2();
    const data3 = await get_json_3();
    const data4 = await get_json_4();


    async function post_data(arr:Array<{trans_name:string, trans_date:Date, amount:number, category:string, trans_id:number}>) {
        for(let i = 0; i<arr.length; i++){
            await post_transaction({
                trans_name: arr[i].trans_name,
                trans_date : arr[i].trans_date,
                amount : arr[i].amount,
                category : arr[i].category,
                trans_id : arr[i].trans_id
            }, user_id)
        }
    }


    var res;
    const res1 = await get_data_item(data1,trans_date, amount, category);
    res = await post_data(res1)
    console.log(res);
    
    
    const res2 = await get_data_item(data2,trans_date, amount, category);
    res = await post_data(res2)
    console.log(res);
    
    
    const res3 = await get_data_item(data3,trans_date, amount, category);
    res = await post_data(res3)
    console.log(res);
    

    const res4 = await get_data_item(data4,trans_date, amount, category);
    res = await post_data(res4)
    console.log(res);
    

          
};



function get_data_item(data:Array<{trans_id:number, trans_name:string, trans_date:Date, amount:number, category:string}>, trans_date:Date, amount:number, category:string) {

    const final_data_1 = [];
    const final_data_2 = [];
    const final_data_3 = [];
    const final_data_4 = [];

    const final_data = [];

    trans_date = new Date(trans_date);
    amount = Number(amount);

    let prev_month = data[0].trans_date.getMonth()+1 
    let curr_month = 0;
    let old_month_length = 0;
    let curr_month_length = 0;
    
 
    
    for(let i = 0; i < data.length; i++) {
    
    curr_month = data[i].trans_date.getMonth()+1;
    
            
    if(curr_month === prev_month) {
        curr_month_length++;  
        //console.log(curr_month_length);
    }

            if(curr_month != prev_month || curr_month_length == data.length-1) {
                
                
                for(let j = old_month_length; j <= curr_month_length ; j++) {
    
                    //console.log(curr_month_length);
                    
                    let json_category = data[j].category;
    
                    if(leven.similarity(json_category, category) >= 0.8) {
                        final_data_1.push(data[j])
                    }
                }
    
                for(let j = 0; j < final_data_1.length; j++) {

                    let json_amount = final_data_1[j].amount;
                    let json_category = final_data_1[j].category;
    
                if ((leven.similarity(json_category, category)) >= 0.8 && (Math.ceil(Math.abs(json_amount-amount))) <= 20) {
                    final_data_2.push(final_data_1[j])
                }
    
            }
            if(final_data_2.length == 0) final_data.push(final_data_1[0])
    
            if(final_data_2.length === 1) final_data.push(final_data_2[0])
    
            if(final_data_2.length > 1) {
                for(let j = 0; j < final_data_2.length; j++) {
    
                    let json_amount = final_data_2[j].amount;
    
                    if(Math.ceil(Math.abs(json_amount-amount)) <= 10) {
                        final_data_3.push(final_data_2[j])
                    }
                }
            }
    
            if(final_data_3.length == 0 && final_data_2.length > 1) final_data.push(final_data_2[0])
    
            if(final_data_3.length === 1) final_data.push(final_data_3[0])
    
            if(final_data_3.length > 1) {

                for(let j = 0; j<final_data_3.length; j++) {
    
                    let json_date = final_data_3[j].trans_date;
    
                    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        
                    const utc1 = Date.UTC(trans_date.getFullYear(), trans_date.getMonth(), trans_date.getDate());
                    const utc2 = Date.UTC(json_date.getFullYear(), json_date.getMonth(), json_date.getDate());
            
                    if(Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY)) <= 7) {
                        final_data_4.push(final_data_3[j])
                    }
                }
            }
    
            if(final_data_4.length === 0 && final_data_3.length > 1) final_data.push(final_data_3[0])
    
            if(final_data_4.length >= 1 ) final_data.push(final_data_4[0])
    
            prev_month = curr_month;
            old_month_length = curr_month_length+1;
            curr_month_length += 1;
            

            final_data_1.splice(0, final_data_1.length);
            final_data_2.splice(0, final_data_2.length);
            final_data_3.splice(0, final_data_3.length);
            final_data_4.splice(0, final_data_4.length);
        }
    }
    return final_data;
}
    
        
        
