import Redis from "ioredis";
import { NextRequest, NextResponse } from "next/server";

// Настройка подключения к локальному Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
});

export const config = {
  runtime: "edge", // Возможно потребуется изменить на "nodejs" если возникнут проблемы
};

export default async function incr(req: NextRequest): Promise<NextResponse> {
  if (req.method !== "POST") {
    return new NextResponse("use POST", { status: 405 });
  }
  if (req.headers.get("Content-Type") !== "application/json") {
    return new NextResponse("must be json", { status: 400 });
  }

  const body = await req.json();
  const slug = body.slug;
  
  if (!slug) {
    return new NextResponse("Slug not found", { status: 400 });
  }

  const ip = req.ip;
  if (ip) {
    // Хеширование IP-адреса
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip)
    );
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Проверка уникальности посещения
    const key = `deduplicate:${hash}:${slug}`;
    const isNew = await redis.set(key, "1", "EX", 86400, "NX");
    
    if (!isNew) {
      return new NextResponse(null, { status: 202 });
    }
  }

  // Увеличиваем счетчик просмотров
  await redis.incr(`projects:${slug}:views`);
  return new NextResponse(null, { status: 202 });
}