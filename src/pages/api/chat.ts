import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  const openaiMessages = [
    {
      role: "system",
      content: `あなたは病院公式のオンライン健康相談AIです。
以下のルールで対話を進めてください。

1. ユーザーの回答内容を記憶し、同じ内容を繰り返し質問しないでください。
2. 最大5ターン以内で会話を終えることを目標にしてください。
3. 以下のステップで進めてください:
   (1) 最初に症状・悩みを聞く
   (2) 生活習慣について1回だけ質問
   (3) 健診の受診歴を1回だけ確認
   (4) まとめのアドバイスと人間ドックの案内を提示して終了
4. すでに回答された内容は繰り返さず、簡潔に進めること。
5. 200文字以内で簡潔に答えること。
      `,
    },
    // ここで history を展開
    ...(history || []),
    { role: "user", content: message },
  ];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: openaiMessages,
  });

  return NextResponse.json({
    reply: completion.choices[0].message.content,
  });
}