import express from 'express';
import { Request,Response } from 'express';
import { myDataSource } from './config/data_base';
import { regist_user,user_login } from './services/user.services';
import { Name,Email,Password,Phone } from './middlewares/middleware';
const dotenv = require('dotenv');





dotenv.config();

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
    res.status(data.status).send(data);
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

