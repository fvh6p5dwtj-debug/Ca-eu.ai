import { NextResponse } from 'next/server';

const plans = {
  free: { name: 'Free', price: 0, conversations: 50, images: 20, videos: 0 },
  starter: { name: 'Starter', price: 99, conversations: 1000, images: 200, videos: 0 },
  growth: { name: 'Growth', price: 299, conversations: 5000, images: 1000, videos: 10 },
  enterprise: { name: 'Enterprise', price: 'Custom' as const, conversations: 'Unlimited' as const, images: 'Unlimited' as const, videos: 'Unlimited' as const },
};

export async function GET() {
  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const { email, name, password } = await req.json();
  
  // Simulate user creation
  return NextResponse.json({ success: true, message: 'User created successfully' });
}
