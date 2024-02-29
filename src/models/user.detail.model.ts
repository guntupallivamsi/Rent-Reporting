import { Entity,PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Forget_password } from "./forget.password.model";

@Entity()

export class User{
    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    name! : string;

    @Column()
    email!:string;

    @Column()
    password!:string;

    @Column()
    phonenumber !: string;
}