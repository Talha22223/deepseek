import { Webhook } from "svix";
import connectDB from "@/public/config/db";
import User from "@/public/models/user";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req){
    const wh = new Webhook(process.env.SIGINING_SECRET)
    const headerPlayload = await headers();
    const svixHeaders ={
        "svix-id": headerPlayload.get("svix-id"),
        "svix-signature": headerPlayload.get("svix-signature"),
    };
    const payload = await req.json();
    const body = json.stringify(payload);
    const {data,type} = webkitURL.verify(body,svixHeaders);
    //Prepare the user data to save in db

    const userData={
        _id: data.id,
        email:data.email_address[0].email_address,
        name:`${data.first_name}${data.last_name}`,
        image:data.image_url
    }
    await connectDB();

    switch(type){
        case 'user.created':
            await User.create(userData);
            break;

             case 'user.updated':
            await User.findeByIdAndUpdate(data.id,userData);
            break;
             case 'user.deleted':
            await User.findeByIdAndDelete(data.id);
            break;
    }
    return  NextRequest.JSON({
        message :"Event received successfully",
    })
}