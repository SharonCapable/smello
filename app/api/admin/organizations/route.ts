import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
    try {
        const db = adminDb()
        const snapshot = await db.collection("organizations").get()

        const organizations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return NextResponse.json({ organizations })

    } catch (error: any) {
        console.error("List Orgs API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
