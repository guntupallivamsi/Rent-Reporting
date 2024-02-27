import express from 'express';
import { Request,Response } from 'express';
import dotenv from 'dotenv';
import { Email, Name, Password, Phone } from './middlewares/middleware';


dotenv.config();

const app = express();
const port = process.env.APP_PORT


app.use(express.json());


app.get('/',(req:Request, res:Response) => {
    res.send('Hello from Express');
});


app.post('/user-registration', [Name,Email,Password,Phone], (req:Request, res:Response) => {
    res.json({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        phone : req.body.phone
    })
});






app.listen(port,()=>{
    console.log(`Listerning from ${port}`);
});