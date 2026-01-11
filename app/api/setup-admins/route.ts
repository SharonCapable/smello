import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase-admin"

export async function GET() {
    try {
        const db = adminDb()
        const auth = adminAuth()
        const emails = ["sharon@ayadata.ai", "sharyere7@gmail.com"]
        const results = []

        for (const email of emails) {
            try {
                // Find user by email
                const userRecord = await auth.getUserByEmail(email)

                // Update custom claims (optional but good practice)
                await auth.setCustomUserClaims(userRecord.uid, { superAdmin: true })

                // Update Firestore User Document
                await db.collection("users").doc(userRecord.uid).set({
                    email: email,
                    isSuperAdmin: true,
                    updatedAt: new Date()
                }, { merge: true })

                results.push({ email, status: "success", uid: userRecord.uid })
            } catch (error: any) {
                results.push({ email, status: "failed", error: error.message })
            }
        }

        return NextResponse.json({ results })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
