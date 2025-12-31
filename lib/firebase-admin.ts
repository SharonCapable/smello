import admin from 'firebase-admin'

export function initAdmin() {
    if (admin.apps && admin.apps.length) return admin

    let serviceAccount: any
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT

    if (raw) {
        serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw
    } else {
        // Fallback to local file for development
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const fs = require('fs')
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const path = require('path')
            const filePath = path.join(process.cwd(), 'firebase-service-account.json')
            if (fs.existsSync(filePath)) {
                serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'))
            } else {
                throw new Error('FIREBASE_SERVICE_ACCOUNT is not set and firebase-service-account.json not found')
            }
        } catch (e) {
            console.error('Firebase Admin initialization error fallback:', e)
            throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
        }
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    })
}

export const adminDb = () => {
    initAdmin()
    return admin.firestore()
}

export const adminAuth = () => {
    initAdmin()
    return admin.auth()
}

export default admin
