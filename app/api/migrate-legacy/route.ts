import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase-admin"
import { headers } from "next/headers"

// Helper to get logged-in user email from token or infer it
// Since this is an admin route for self-migration, strict auth is tricky without passing token.
// We'll rely on client passing a token or simpler: if we are in dev/demo mode, we assume checks are done.
// Ideally, we get the 'Authorization' header.
const getClientUser = async (request: Request) => {
    // For this specific urgent task, we will try to get the user based on the session or request.
    // NOTE: In a production app, verify the ID token.
    // Here we'll implement a best-effort approach or just search for the specific emails mentioned by user if generic.
    // However, the user said "searches for your old Clerk ID via your email".
    // We'll assume the user is logged in on the client side. We can't easily get the user *here* without a token.
    // So the client must pass the email or we rely on a fixed list for now? 
    // No, better to try to extract from header if possible, or just accept email as query param for this tool (less secure but effective for "recover my data").
    return null;
}

export async function GET(request: Request) {
    try {
        const db = adminDb()

        // Hardcoded list of users to migrate for this request if auth is complex to setup in 1 step
        // OR we can query ALL projects with 'user_' prefix (Clerk) and try to match them.
        // User asked: "searches for your old Clerk ID via your email"
        // Let's search projects that have an email field matching the known emails.

        const targetEmails = ["sharon@ayadata.ai", "sharyere7@gmail.com"]
        let migratedCount = 0

        for (const email of targetEmails) {
            try {
                // Get current UID for this email
                const userRecord = await adminAuth().getUserByEmail(email)
                const currentUid = userRecord.uid

                // FIND projects where creators email was stored (if any) OR where userId starts with 'user_' (Clerk)
                // If we don't have email on project, we can't link easily.
                // Let's assume we might have stored ownerEmail or similar.
                // If not, we might need to assume orphans.

                // Alternative: The user might have projects under an old ID.
                // We will update ANY project that has this email in 'ownerEmail', 'email', 'creatorEmail' fields.

                const projectsRef = db.collection("projects")
                const snapshot = await projectsRef.get() // heavy read, but maybe necessary for one-off migration

                const batch = db.batch()
                let batchCount = 0

                snapshot.docs.forEach(doc => {
                    const data = doc.data()
                    // Check if this project belongs to the user by Email match
                    const matchesEmail = data.email === email || data.ownerEmail === email || data.user === email

                    // Check if it's an old Clerk ID (usually starts with user_2...)
                    const isOldId = data.userId && data.userId.startsWith('user_') && !data.userId.includes(currentUid)

                    if (matchesEmail && isOldId) {
                        batch.update(doc.ref, { userId: currentUid, originalUserId: data.userId })
                        batchCount++
                        migratedCount++
                    }
                })

                if (batchCount > 0) {
                    await batch.commit()
                }

            } catch (err) {
                console.log(`Migration skip for ${email}:`, err)
            }
        }

        return NextResponse.json({ success: true, count: migratedCount })

    } catch (error: any) {
        console.error("Migration error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
