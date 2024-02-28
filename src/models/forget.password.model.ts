import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.detail.model";

@Entity()
export class Forget_password {
    
    @PrimaryGeneratedColumn()
    id! : number

    @Column()
    email !: string

    @OneToOne(() => User, (user)=>user.Password)
    @JoinColumn()
    user!:User
    
}