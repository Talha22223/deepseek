import { Webhook } from "svix";
import connectDB from "@/public/config/db";
import User from "@/public/models/user";
import UserSchema from '@/path/to/UserSchema'; // Make sure this import is correct
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(req){
    const wh = new Webhook(process.env.SIGINING_SECRET);
    const headerPayload = headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-signature": headerPayload.get("svix-signature"),
        "svix-timestamp": headerPayload.get("svix-timestamp"),
    };
    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);
    // Prepare the user data to save in db

    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url
    };
    await connectDB();

    switch (type) {
        case 'user.created':
            await User.create(userData);
            break;

        case 'user.updated':
            await User.findByIdAndUpdate(data.id, userData);
            break;
        case 'user.deleted':
            await User.findByIdAndDelete(data.id);
            break;
    }
    return Response.json({
        message: "Event received successfully",
    });
}