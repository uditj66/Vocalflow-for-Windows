import { NextResponse } from "next/server";
import { deepgramFetch, getDeepgramProjectId } from "@/lib/deepgram";

export async function GET() {
  try {
    const projectId = await getDeepgramProjectId();
    const res = await deepgramFetch(`/v1/projects/${projectId}/balances`);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to fetch balance: ${res.status} ${text}` },
        { status: res.status },
      );
    }

    const data = (await res.json()) as {
      balances?: Array<{ amount: number; units: string }>;
    };
    const first = data.balances?.[0];

    if (!first) {
      return NextResponse.json({ balance: "$0.00" });
    }

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: first.units || "USD",
    });

    return NextResponse.json({
      balance: formatter.format(first.amount),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error fetching balance",
      },
      { status: 500 },
    );
  }
}
