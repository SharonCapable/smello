import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const orgId = searchParams.get("orgId")

    if (!orgId) {
        return NextResponse.json({ error: "Missing orgId" }, { status: 400 })
    }

    try {
        const db = adminDb()

        // Fetch teams for the organization using Admin SDK
        const teamsRef = db.collection("organizations").doc(orgId).collection("teams")
        const snapshot = await teamsRef.get()

        const teams = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || "Unknown Team",
            description: doc.data().description || ""
        }))

        return NextResponse.json({ teams })
    } catch (error) {
        console.error("Get Teams API error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
