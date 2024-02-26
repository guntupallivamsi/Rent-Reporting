import express from 'express';
import { Request,Response } from 'express';
import dotenv from 'dotenv';



dotenv.config();

const app = express();
const port = process.env.APP_PORT


app.use(express.json());


app.get('/',(req:Request, res:Response) => {
    res.send('Hello from Express');
});


app.post('/user-registration', (req:Request, res:Response) => {
    const {name, email, password, phone} = req.body;
    res.json({
        name : name,
        email : email,
        password : password,
        phone : phone
    })
});



app.listen(port,()=>{
    console.log(`Listerning from ${port}`);
});