import express from 'express';
import { Request,Response } from 'express';
import { myDataSource } from './config/data_base';
import { regist_user } from './services/user.services';
import { Email, Name, Password, Phone } from './middlewares/middleware';
import dotenv from 'dotenv';





dotenv.config();

const app = express();
const port = process.env.APP_PORT


app.use(express.json());


app.get('/',(req:Request, res:Response) => {
    res.send('Hello from Express');
});


app.use(Name, Email, Password, Phone)
app.post('/user-registration', async (req:Request, res:Response) => {
    const data = await regist_user(req.body);
    res.json(data);
   
});


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

