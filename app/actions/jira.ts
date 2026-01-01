'use server'

export interface JiraIssue {
    key: string
    summary: string
    description: string
    type: string
}

export async function fetchJiraProjectData(domain: string, email: string, token: string, projectKey: string): Promise<JiraIssue[]> {
    // Mock Mode for easy testing
    if (domain.includes('demo') || token === 'demo') {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake latency
        return getMockJiraData(projectKey);
    }

    // Clean domain input
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const auth = Buffer.from(`${email}:${token}`).toString('base64');

    // JQL to get all issues in project
    const url = `https://${cleanDomain}/rest/api/3/search?jql=project=${projectKey}&fields=summary,description,issuetype,status,priority&maxResults=50`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("JIRA API Error:", response.status, errorText);
            throw new Error(`Failed to fetch from JIRA (${response.status}). Check credentials.`);
        }

        const data = await response.json();

        if (!data.issues || !Array.isArray(data.issues)) {
            return [];
        }

        return data.issues.map((issue: any) => {
            // JIRA Description can be ADF (JSON) or string. We try to stringify if it's object or grab raw.
            let desc = "";
            if (typeof issue.fields.description === 'string') {
                desc = issue.fields.description;
            } else if (issue.fields.description) {
                // Simplified extraction or just stringify
                desc = JSON.stringify(issue.fields.description);
            }

            return {
                key: issue.key,
                summary: issue.fields.summary,
                description: desc,
                type: issue.fields.issuetype.name
            }
        });

    } catch (error) {
        console.error("Jira Action Error:", error);
        throw error;
    }
}

function getMockJiraData(key: string): JiraIssue[] {
    // Yes, user is cooking.
    return [
        { key: `${key}-1`, summary: "Implement OAuth Login", description: "As a user I want to login with Google so I don't have to remember passwords.", type: "Story" },
        { key: `${key}-2`, summary: "Dashboard Analytics Widgets", description: "Create a dashboard that shows daily active users and retention rates. Should include charts.", type: "Story" },
        { key: `${key}-3`, summary: "Payment Gateway Integration", description: "Integrate Stripe for handling subscription payments and invoices.", type: "Story" },
        { key: `${key}-4`, summary: "User Profile Management", description: "Allow users to update their avatar, bio, and password.", type: "Story" },
        { key: `${key}-5`, summary: "Admin Panel - User Moderation", description: "Admins need to ban users who violate TOS. Include search and filter.", type: "Epic" },
        { key: `${key}-6`, summary: "Export Data to CSV", description: "Users should be able to download their activity log as CSV.", type: "Story" },
    ];
}
