import express from 'express';
import { Express,Request,Response } from 'express';
import { myDataSource } from './config/data_base';
import { forgot_password, get_json_1, otp_verify, regist_user,user_login } from './services/user.service';
import { Name,Email,Password,Phone } from './middlewares/middleware';
import dotenv from 'dotenv';


dotenv.config({path:process.cwd()+'/.env'});

const app = express();
const port = process.env.APP_PORT


app.use(express.json());

app.get('/',(req:Request, res:Response) => {
    res.send('Hello from Express');
});


app.post('/user-registration', [Name,Email,Password,Phone],async (req:Request, res:Response) => {
    const data = await regist_user(req.body);
    res.status(200).json(data);
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

app.get('/json_1'),async(req:Request, res: Response) => {
    const data = await get_json_1();
    res.send(data);
}

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

