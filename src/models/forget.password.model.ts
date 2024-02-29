import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./user.detail.model";

@Entity()
export class Forget_password {
    
    @PrimaryGeneratedColumn()
    id! : number;

    @Column()
    email !: string;

    @Column()
    otp!:string;

    @Column()
    expiresat!:Date
}