import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase-admin"
import { headers } from "next/headers"

// Verify Firebase ID token from Authorization header
async function verifyAuthToken(request: Request): Promise<{ uid: string, email: string } | null> {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) return null

        const token = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth().verifyIdToken(token)
        return { uid: decodedToken.uid, email: decodedToken.email || '' }
    } catch (e) {
        console.error('Token verification failed:', e)
        return null
    }
}

// GET: Admin migration for hardcoded emails (legacy support)
export async function GET(request: Request) {
    try {
        const db = adminDb()
        const { searchParams } = new URL(request.url)
        const emailParam = searchParams.get('email')

        // Use query param email or fallback to hardcoded list
        const targetEmails = emailParam ? [emailParam] : ["sharon@ayadata.ai", "sharyere7@gmail.com"]
        let migratedCount = 0
        const results: { email: string, migrated: number, currentUid?: string, oldIds?: string[] }[] = []

        for (const email of targetEmails) {
            try {
                // Get current UID for this email
                const userRecord = await adminAuth().getUserByEmail(email)
                const currentUid = userRecord.uid

                const projectsRef = db.collection("projects")
                const snapshot = await projectsRef.get()

                const batch = db.batch()
                let batchCount = 0
                const oldIds: string[] = []

                snapshot.docs.forEach(doc => {
                    const data = doc.data()
                    // Check if this project belongs to the user by Email match
                    const matchesEmail = data.email === email || data.ownerEmail === email || data.user === email

                    // Check if it's an old Clerk ID (usually starts with user_2...)
                    const isOldId = data.userId && data.userId.startsWith('user_') && data.userId !== currentUid

                    if (matchesEmail && isOldId) {
                        batch.update(doc.ref, { userId: currentUid, originalUserId: data.userId })
                        oldIds.push(data.userId)
                        batchCount++
                        migratedCount++
                    }
                })

                if (batchCount > 0) {
                    await batch.commit()
                }

                results.push({ email, migrated: batchCount, currentUid, oldIds })

            } catch (err: any) {
                console.log(`Migration skip for ${email}:`, err?.message)
                results.push({ email, migrated: 0 })
            }
        }

        return NextResponse.json({ success: true, totalMigrated: migratedCount, results })

    } catch (error: any) {
        console.error("Migration error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST: Authenticated user can migrate their own projects from old Clerk IDs
export async function POST(request: Request) {
    try {
        const user = await verifyAuthToken(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = adminDb()
        const { oldUserId } = await request.json().catch(() => ({}))

        const projectsRef = db.collection("projects")

        // If oldUserId provided, migrate from that specific ID
        // Otherwise, search for any old Clerk IDs that could match
        let snapshot
        if (oldUserId) {
            snapshot = await projectsRef.where('userId', '==', oldUserId).get()
        } else {
            // Search all projects looking for Clerk-style IDs starting with 'user_'
            snapshot = await projectsRef.get()
        }

        const batch = db.batch()
        let migratedCount = 0
        const migratedProjects: string[] = []

        snapshot.docs.forEach(doc => {
            const data = doc.data()

            // If specific oldUserId, migrate those
            if (oldUserId && data.userId === oldUserId) {
                batch.update(doc.ref, {
                    userId: user.uid,
                    originalUserId: data.userId,
                    migratedAt: new Date()
                })
                migratedCount++
                migratedProjects.push(data.name || doc.id)
            }
            // If searching all, migrate old Clerk IDs that match user's email
            else if (!oldUserId && data.userId?.startsWith('user_') && data.userId !== user.uid) {
                // Only migrate if we can verify ownership via email
                const ownerEmail = data.email || data.ownerEmail || data.user
                if (ownerEmail === user.email) {
                    batch.update(doc.ref, {
                        userId: user.uid,
                        originalUserId: data.userId,
                        migratedAt: new Date()
                    })
                    migratedCount++
                    migratedProjects.push(data.name || doc.id)
                }
            }
        })

        if (migratedCount > 0) {
            await batch.commit()
        }

        return NextResponse.json({
            success: true,
            migratedCount,
            migratedProjects,
            newUserId: user.uid
        })

    } catch (error: any) {
        console.error("Migration error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
