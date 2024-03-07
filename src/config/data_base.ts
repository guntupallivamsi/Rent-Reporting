import { DataSource } from "typeorm";
const dotenv = require('dotenv');

dotenv.config({path:process.cwd()+'/.env'})



export const myDataSource : DataSource= new DataSource({
    type : "mysql",
    host : "localhost",
    port :  Number(process.env.Mysql_PORT),
    username : process.env.Mysql_username,
    password : process.env.Mysql_password,
    database : process.env.database,
    entities : ["src/models/*.ts"],
    synchronize : true,
    logging : true
})

