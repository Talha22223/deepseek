import { Webhook } from 'svix';
import { headers } from 'next/headers';
import connectDB from '@/public/config/db';
import User from '@/public/models/user';

export async function POST(req) {
  try {
    // Verify webhook signature
    if (!process.env.SIGNING_SECRET) {
      return Response.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const wh = new Webhook(process.env.SIGNING_SECRET);
    const headerPayload = headers();
    const svixHeaders = {
      'svix-id': headerPayload.get('svix-id'),
      'svix-signature': headerPayload.get('svix-signature'),
      'svix-timestamp': headerPayload.get('svix-timestamp'),
    };

    if (!svixHeaders['svix-id'] || !svixHeaders['svix-signature'] || !svixHeaders['svix-timestamp']) {
      return Response.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    // Verify the payload
    let data, type;
    try {
      const event = wh.verify(body, svixHeaders);
      data = event.data;
      type = event.type;
    } catch (err) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Process webhook event
    switch (type) {
      case 'user.created':
        await User.create({
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          image: data.image_url || '',
        });
        break;

      case 'user.updated':
        await User.findByIdAndUpdate(
          data.id,
          {
            email: data.email_addresses?.[0]?.email_address,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            image: data.image_url,
          },
          { upsert: true }
        );
        break;

      case 'user.deleted':
        await User.findByIdAndUpdate(data.id, { isActive: false });
        break;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}