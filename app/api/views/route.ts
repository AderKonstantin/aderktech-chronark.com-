import { NextResponse } from "next/server";
import { getRedisClient } from "../../../lib/redis";

export const dynamic = 'force-dynamic'; // Отключаем кеширование

export async function GET() {
    try {
        const redis = getRedisClient();
        const projects = await redis.keys("projects:*:views");
        const viewsEntries = await redis.mget(...projects);

        const viewsData = projects.reduce((acc, key, index) => {
            const slug = key.split(":")[1];
            acc[slug] = parseInt(viewsEntries[index] as string) || 0;
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json(viewsData);
    } catch (error) {
        console.error("Redis error:", error);
        return NextResponse.json(
            { error: "Failed to fetch views" },
            { status: 500 }
        );
    }
}