import express from 'express';
import { Express,Request,Response } from 'express';
import { myDataSource } from './config/data_base';
import { forgot_password, otp_verify, regist_user,user_login, get_json_1, get_json_2,get_json_3, get_json_4 } from './services/user.service';
import { Name,Email,Password,Phone } from './middlewares/middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.APP_PORT


app.use(express.json());

app.get('/',(req:Request, res:Response) => {
    res.send('Hello from Express');
});


app.post('/user-registration', [Name,Email,Password,Phone],async (req:Request, res:Response) => {
    console.log(req.body); 
    const data = await regist_user(req.body);  
    return res.send('Successfully registered');
});


app.post('/user-login', async (req:Request, res:Response) => {
    const data = await user_login(req.body);
    res.send(data);
});

app.post('/forgot-password',async (req:Request, res:Response) => {
    const data = await forgot_password(req.body.email);
    res.send(data);
});

app.post('/verify-otp',async (req:Request, res:Response) => {
    const data = await otp_verify(req,req.body.otp,req.body.password);
    res.send(data);
});


app.get('/get-json-1', async (req:Request, res:Response) => {
    const data = await get_json_1();
    res.json(data);
});


app.get('/get-json-2', async (req:Request, res:Response) => {
    const data = await get_json_2();
    res.send(data);
}); 


app.get('/get-json-3', async (req:Request, res:Response) => {
    const data = await get_json_3();
    res.send(data)
});


app.get('/get-json-4', async (req:Request, res:Response) => {
    const data = await get_json_4();
    res.send(data);
})


app.listen(port, ()=>{
    myDataSource.initialize()
    .then(()=>{
        console.log(`listening from port ${port}`);
        console.log('Database connected');
    })
    .catch((err)=>{
        console.log(err);
    })
})

