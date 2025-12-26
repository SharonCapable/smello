import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

import { FirebaseAuthBridge } from "@/components/firebase-auth-bridge"

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-noto-sans", weight: ["400", "500", "700"] })


export const metadata: Metadata = {
  title: "SMELLO Product Management Toolkit",
  description: "SMELLO: Your Product Management starter pack. Prioritize features, generate ideas & user stories, manage research, and integrate with JIRA/Slack/Google Drive.",
  generator: "v0.app",
  icons: {
    icon: '/favicon-new.png',
    apple: '/favicon-new.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6366f1',
          borderRadius: '0.5rem',
          colorBackground: '#1a1a1a',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          card: 'bg-background border border-border shadow-xl',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'bg-background border-border text-foreground hover:bg-muted',
          formFieldLabel: 'text-foreground',
          formFieldInput: 'bg-background border-border text-foreground',
          footerActionLink: 'text-primary hover:text-primary/90',
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans ${notoSans.variable}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <FirebaseAuthBridge />
            <Suspense fallback={null}>{children}</Suspense>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
