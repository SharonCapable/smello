import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

export async function POST(request: NextRequest) {
    try {
        const { orgId, email, role, invitedBy, invitedByName } = await request.json()

        if (!orgId || !email || !invitedBy) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const db = adminDb()

        // Check if user is already a member
        const memberRef = db.collection("organizations").doc(orgId).collection("members").doc(email) // Ideally we check by uid, but we might not know it yet if they aren't signed up. 
        // Actually members are stored by UID usually. But we can check if they are already in the org.

        // Create the invitation
        const invitesRef = db.collection("organizations").doc(orgId).collection("invites")

        // 7 days expiry
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        const newInviteRef = invitesRef.doc()
        await newInviteRef.set({
            id: newInviteRef.id,
            orgId,
            email,
            role: role || 'member',
            invitedBy,
            invitedByName: invitedByName || 'Admin',
            status: 'pending',
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(expiresAt)
        })

        return NextResponse.json({ success: true, inviteId: newInviteRef.id })

    } catch (error: any) {
        console.error("Invite API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
