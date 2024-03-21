
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.detail.model";

@Entity()

export class Transaction{
    @PrimaryGeneratedColumn()
    id!:number;

    @Column()
    trans_id!:number;

    @Column()
    trans_name!:string;

    @Column()
    trans_date!:Date;

    @Column()
    amount!: number;

    @Column()
    category!:string;


    @ManyToOne(()=>User,(user)=>user.transactions)
    @JoinColumn()
    user!:User
}

