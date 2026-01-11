import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const orgId = searchParams.get("orgId")
    const email = searchParams.get("email")

    if (!orgId || !email) {
        return NextResponse.json({ error: "Missing required params" }, { status: 400 })
    }

    try {
        const db = adminDb()
        const invitesRef = db.collection("organizations").doc(orgId).collection("invites")

        // Query for pending invites for this email
        const snapshot = await invitesRef
            .where("email", "==", email)
            .where("status", "==", "pending")
            .get()

        if (snapshot.empty) {
            return NextResponse.json({ invite: null })
        }

        // Check if ANY of the potential pending invites are valid (not expired)
        // Usually there should be only one pending invite per email, but let's handle multiples
        let validInvite = null

        for (const doc of snapshot.docs) {
            const data = doc.data()
            if (data.expiresAt) {
                const expires = data.expiresAt.toDate()
                if (expires > new Date()) {
                    validInvite = { id: doc.id, ...data }
                    break
                }
            } else {
                // No expiry? Consider valid
                validInvite = { id: doc.id, ...data }
                break
            }
        }

        return NextResponse.json({ invite: validInvite })

    } catch (error) {
        console.error("Check Invite API error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
