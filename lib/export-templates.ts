import type { StoredProject } from "@/lib/storage"

// Jira CSV Import Template
export function exportForJira(project: StoredProject): string {
  const headers = [
    "Issue Type",
    "Summary",
    "Description",
    "Epic Name",
    "Epic Link",
    "Priority",
    "Story Points",
    "Acceptance Criteria",
    "Labels",
  ]

  const rows = [headers.join(",")]

  // Add Epic rows first
  project.epics.forEach((epic) => {
    const epicRow = [
      "Epic",
      `"${epic.title}"`,
      `"Epic for ${epic.title}"`,
      `"${epic.title}"`,
      "",
      "Medium",
      "",
      "",
      `"${project.product.name.replace(/\s+/g, "-").toLowerCase()}"`,
    ]
    rows.push(epicRow.join(","))
  })

  // Add Story rows
  project.epics.forEach((epic) => {
    epic.user_stories.forEach((story) => {
      const description = `${story.description}

**Acceptance Criteria:**
${story.acceptance_criteria.map((criteria) => `• ${criteria}`).join("\n")}

**Edge Cases:**
${story.edge_cases.map((edge) => `• ${edge}`).join("\n")}

**Validations:**
${story.validations.map((validation) => `• ${validation}`).join("\n")}

${story.optional_fields?.risk_notes ? `**Risk Notes:** ${story.optional_fields.risk_notes}` : ""}`

      const storyRow = [
        "Story",
        `"${story.description.split(",")[0]}"`, // Use first part as summary
        `"${description.replace(/"/g, '""')}"`,
        `"${epic.title}"`,
        `"${epic.id}"`,
        story.optional_fields?.priority || "Medium",
        story.optional_fields?.effort_estimate?.match(/\d+/)?.[0] || "",
        `"${story.acceptance_criteria.join("; ")}"`,
        `"${project.product.name.replace(/\s+/g, "-").toLowerCase()},${story.id.toLowerCase()}"`,
      ]
      rows.push(storyRow.join(","))
    })
  })

  return rows.join("\n")
}

// Trello JSON Import Template
export function exportForTrello(project: StoredProject): string {
  const board = {
    name: project.product.name,
    desc: project.product.description,
    lists: [
      { name: "Backlog", cards: [] as any[] },
      { name: "In Progress", cards: [] as any[] },
      { name: "Done", cards: [] as any[] },
    ],
  }

  project.epics.forEach((epic) => {
    // Add epic as a card in backlog
    board.lists[0].cards.push({
      name: `[EPIC] ${epic.title}`,
      desc: `Epic: ${epic.title}\n\nUser Stories: ${epic.user_stories.length}`,
      labels: [{ name: "Epic", color: "purple" }],
    })

    // Add user stories as cards
    epic.user_stories.forEach((story) => {
      const description = `${story.description}

## Acceptance Criteria
${story.acceptance_criteria.map((criteria) => `- [ ] ${criteria}`).join("\n")}

## Edge Cases
${story.edge_cases.map((edge) => `- ${edge}`).join("\n")}

## Validations
${story.validations.map((validation) => `- ${validation}`).join("\n")}

${story.optional_fields?.priority ? `**Priority:** ${story.optional_fields.priority}` : ""}
${story.optional_fields?.effort_estimate ? `**Effort:** ${story.optional_fields.effort_estimate}` : ""}
${story.optional_fields?.risk_notes ? `**Risk Notes:** ${story.optional_fields.risk_notes}` : ""}`

      const labels = [
        { name: "User Story", color: "blue" },
        { name: epic.title, color: "green" },
      ]

      if (story.optional_fields?.priority) {
        const priorityColors: Record<string, string> = {
          Low: "green",
          Medium: "yellow",
          High: "orange",
          Critical: "red",
        }
        labels.push({
          name: story.optional_fields.priority,
          color: priorityColors[story.optional_fields.priority] || "gray",
        })
      }

      board.lists[0].cards.push({
        name: story.id,
        desc: description,
        labels,
      })
    })
  })

  return JSON.stringify(board, null, 2)
}

// ClickUp CSV Template
export function exportForClickUp(project: StoredProject): string {
  const headers = [
    "Task Name",
    "Description",
    "Status",
    "Priority",
    "Assignee",
    "Tags",
    "Due Date",
    "Time Estimate",
    "Parent Task",
  ]

  const rows = [headers.join(",")]

  project.epics.forEach((epic) => {
    // Add epic as parent task
    const epicRow = [
      `"${epic.title}"`,
      `"Epic: ${epic.title}"`,
      "Open",
      "Normal",
      "",
      `"epic,${project.product.name.replace(/\s+/g, "-").toLowerCase()}"`,
      "",
      "",
      "",
    ]
    rows.push(epicRow.join(","))

    // Add user stories as subtasks
    epic.user_stories.forEach((story) => {
      const description = `${story.description}

Acceptance Criteria:
${story.acceptance_criteria.map((criteria) => `• ${criteria}`).join("\n")}

Edge Cases:
${story.edge_cases.map((edge) => `• ${edge}`).join("\n")}

Validations:
${story.validations.map((validation) => `• ${validation}`).join("\n")}

${story.optional_fields?.risk_notes ? `Risk Notes: ${story.optional_fields.risk_notes}` : ""}`

      const priority = story.optional_fields?.priority
        ? story.optional_fields.priority === "Critical"
          ? "Urgent"
          : story.optional_fields.priority
        : "Normal"

      const storyRow = [
        `"${story.id}"`,
        `"${description.replace(/"/g, '""')}"`,
        "Open",
        priority,
        "",
        `"user-story,${epic.title.replace(/\s+/g, "-").toLowerCase()}"`,
        "",
        story.optional_fields?.effort_estimate?.match(/\d+/)?.[0] ? `"${story.optional_fields.effort_estimate}"` : "",
        `"${epic.title}"`,
      ]
      rows.push(storyRow.join(","))
    })
  })

  return rows.join("\n")
}

// Azure DevOps Work Items CSV
export function exportForAzureDevOps(project: StoredProject): string {
  const headers = [
    "Work Item Type",
    "Title",
    "Description",
    "State",
    "Priority",
    "Story Points",
    "Acceptance Criteria",
    "Tags",
    "Parent",
  ]

  const rows = [headers.join(",")]

  project.epics.forEach((epic) => {
    // Add epic
    const epicRow = [
      "Epic",
      `"${epic.title}"`,
      `"${epic.title} - Contains ${epic.user_stories.length} user stories"`,
      "New",
      "2",
      "",
      "",
      `"${project.product.name.replace(/\s+/g, "-").toLowerCase()}"`,
      "",
    ]
    rows.push(epicRow.join(","))

    // Add user stories
    epic.user_stories.forEach((story) => {
      const description = `${story.description}

**Edge Cases:**
${story.edge_cases.map((edge) => `• ${edge}`).join("\n")}

**Validations:**
${story.validations.map((validation) => `• ${validation}`).join("\n")}

${story.optional_fields?.risk_notes ? `**Risk Notes:** ${story.optional_fields.risk_notes}` : ""}`

      const priorityMap: Record<string, string> = {
        Low: "4",
        Medium: "2",
        High: "1",
        Critical: "1",
      }

      const storyRow = [
        "User Story",
        `"${story.description.split(",")[0]}"`,
        `"${description.replace(/"/g, '""')}"`,
        "New",
        priorityMap[story.optional_fields?.priority || "Medium"] || "2",
        story.optional_fields?.effort_estimate?.match(/\d+/)?.[0] || "",
        `"${story.acceptance_criteria.join("; ")}"`,
        `"${project.product.name.replace(/\s+/g, "-").toLowerCase()},${story.id.toLowerCase()}"`,
        `"${epic.title}"`,
      ]
      rows.push(storyRow.join(","))
    })
  })

  return rows.join("\n")
}

// GitHub Issues Template (Markdown)
export function exportForGitHub(project: StoredProject): string {
  let output = `# ${project.product.name} - User Stories\n\n`
  output += `${project.product.description}\n\n`
  output += `## Project Overview\n\n`
  output += `- **Epics:** ${project.epics.length}\n`
  output += `- **User Stories:** ${project.epics.reduce((acc, epic) => acc + epic.user_stories.length, 0)}\n`
  output += `- **Created:** ${new Date(project.created_at).toLocaleDateString()}\n\n`

  output += `## Issues to Create\n\n`
  output += `Copy each section below as a separate GitHub issue:\n\n`
  output += `---\n\n`

  project.epics.forEach((epic) => {
    // Epic issue
    output += `### Epic: ${epic.title}\n\n`
    output += `**Labels:** \`epic\`, \`${project.product.name.replace(/\s+/g, "-").toLowerCase()}\`\n\n`
    output += `Epic for ${epic.title}\n\n`
    output += `**User Stories in this Epic:**\n`
    epic.user_stories.forEach((story) => {
      output += `- [ ] ${story.id}: ${story.description.split(",")[0]}\n`
    })
    output += `\n---\n\n`

    // User story issues
    epic.user_stories.forEach((story) => {
      output += `### ${story.id}\n\n`
      output += `**Labels:** \`user-story\`, \`${epic.title.replace(/\s+/g, "-").toLowerCase()}\``
      if (story.optional_fields?.priority) {
        output += `, \`priority-${story.optional_fields.priority.toLowerCase()}\``
      }
      output += `\n\n`

      output += `${story.description}\n\n`

      output += `## Acceptance Criteria\n\n`
      story.acceptance_criteria.forEach((criteria) => {
        output += `- [ ] ${criteria}\n`
      })

      output += `\n## Edge Cases\n\n`
      story.edge_cases.forEach((edge) => {
        output += `- ${edge}\n`
      })

      output += `\n## Validations\n\n`
      story.validations.forEach((validation) => {
        output += `- ${validation}\n`
      })

      if (story.optional_fields?.effort_estimate) {
        output += `\n**Effort Estimate:** ${story.optional_fields.effort_estimate}\n`
      }

      if (story.optional_fields?.risk_notes) {
        output += `\n**Risk Notes:** ${story.optional_fields.risk_notes}\n`
      }

      output += `\n---\n\n`
    })
  })

  return output
}
