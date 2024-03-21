import { Entity,PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from "typeorm";
import { Transaction } from "./trans.model";
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

    @OneToMany(()=>Transaction, (trans)=>trans.user)
    transactions!:Transaction[]
}