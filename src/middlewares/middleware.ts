import { NextFunction, RequestHandler, Request, Response } from "express";
import jsonwebtoken from 'jsonwebtoken';

const jwt = jsonwebtoken;


export const Name : RequestHandler = (req:Request, res:Response, next:NextFunction) => {
    req.body.name = (req.body.name).trim()
    if(/^[a-zA-Z ]{3,15}$/.test(req.body.name)){
        return next();
    }
    res.status(403).send('Invalid Name');
};


export const Email : RequestHandler = (req:Request, res:Response, next:NextFunction) => {
    const email = req.body.email;
    if(! /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)){
        return res.status(403).send('Invalid email')
    }
      next();
};


export const Password : RequestHandler = (req:Request, res:Response, next:NextFunction) => {
    const passwd = req.body.password;
    if((passwd.length<8 || passwd.length>12)){
        return res.status(400).send('Password Length should be 8-12 characters long');
    }
    else if(passwd.search(/[a-z]/)<0){
      return res.status(400).send('password should contain atleast 1 lowercase character');
    }
    else if(passwd.search(/[A-Z]/)<0){
      return res.status(400).send('password should contain atleast 1 Uppercase character');
    }
    else if(passwd.search(/[0-9]/)<0){
      return res.status(400).send('password should contain atleast 1 number');
    }
    else if(! /[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/.test(passwd)){
      return res.status(400).send('password should contain atleast 1 special character');
    }
    next();
};


export const Phone : RequestHandler = (req:Request, res:Response, next:NextFunction) => {
    const phone = req.body.phone;
    if(/^\d{10}$/.test(phone)){
        return next();
    }
    return res.send('Invalid phone number');
};


// export const verify_token : RequestHandler = async (req:Request, res:Response, next:NextFunction) => {
//   const bearer_token = req.headers['authorization'];
//   const token = bearer_token!.split(" ")[1];
//   console.log(token);
  
//   const result = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET!);
//   if(result){
//     next()
//     return result;  
//   }
//   return res.send('Invalid Token/User');
// };