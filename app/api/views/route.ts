import { NextResponse } from "next/server";
import { getRedisClient } from "../../../lib/redis";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys('projects:*:views');
    if (keys.length === 0) return NextResponse.json({});
    
    const values = await redis.mget(...keys);
    const views = keys.reduce((acc, key, i) => {
      const slug = key.split(':')[1];
      acc[slug] = parseInt(values[i] as string) || 0;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(views);
  } catch (error) {
    console.error('Redis error:', error);
    return NextResponse.json({}, { status: 500 });
  }
}