import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase-admin"

export async function GET() {
    try {
        const auth = adminAuth()
        const db = adminDb()

        // Fetch users from Authentication
        const listUsersResult = await auth.listUsers(100) // Limit to 100 for now

        const users = await Promise.all(listUsersResult.users.map(async (userRecord) => {
            // Also fetch basic profile data from Firestore if exists
            let firestoreData = {}
            try {
                const doc = await db.collection("users").doc(userRecord.uid).get()
                if (doc.exists) {
                    firestoreData = doc.data() || {}
                }
            } catch (e) {
                // Ignore missing firestore doc
            }

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName || (firestoreData as any).displayName || "No Name",
                photoURL: userRecord.photoURL,
                lastSignInTime: userRecord.metadata.lastSignInTime,
                creationTime: userRecord.metadata.creationTime,
                role: (userRecord.customClaims?.superAdmin ? 'Super Admin' : 'User')
            }
        }))

        return NextResponse.json({ users })

    } catch (error: any) {
        console.error("List Users API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
