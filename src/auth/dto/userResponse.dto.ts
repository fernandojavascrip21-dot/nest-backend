import { IsEmail } from 'class-validator';

export class UserResponse{
    email:string;
    name:string;
    isActive:boolean;
    role:string[]
}