import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"
import { FirebaseAuthProvider } from "@/components/firebase-auth-provider"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"


import { Toaster } from "@/components/ui/toaster"

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-noto-sans", weight: ["400", "500", "700"] })


export const metadata: Metadata = {
  title: "SMELLO Product Management Toolkit",
  description: "SMELLO: Your Product Management starter pack. Prioritize features, generate ideas & user stories, manage research, and integrate with JIRA/Slack/Google Drive.",
  generator: "v0.app",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${notoSans.variable}`}>
        <FirebaseAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </ThemeProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  )
}
