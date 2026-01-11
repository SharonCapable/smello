import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.length < 3) {
        return NextResponse.json({ organizations: [] })
    }

    try {
        const db = adminDb()
        // Simple search: filter by name >= query and name < query + 'z'
        // Note: Firestore text search is limited; for production, use Algolia/Typesense.
        // This prefix query works for case-sensitive matches.

        // Try searching by exact name first, then prefix
        const orgsRef = db.collection("organizations")

        // Case-sensitive prefix match
        const snapshot = await orgsRef
            .where("name", ">=", query)
            .where("name", "<=", query + "\uf8ff")
            .limit(5)
            .get()

        const organizations = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            domain: doc.data().domain
        }))

        return NextResponse.json({ organizations })
    } catch (error) {
        console.error("Search API error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
