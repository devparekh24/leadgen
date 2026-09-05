// Email generator service

export function generateEmail(lead: any, tone: string = "professional", templateType: string = "initial_outreach"): string {
  const contactName = lead.owner_name ? lead.owner_name.split(" ")[0] : "there";
  const company = lead.company_name;

  if (templateType === "initial_outreach") {
    if (tone === "casual") {
      return `Hi ${contactName},\n\nI was checking out ${company} and love what you guys are doing in the ${lead.industry} space.\n\nWe help companies like yours scale their operations with AI. Would you be open to a quick chat next week to see if there's a fit?\n\nBest,\nSaaSquatch Team`;
    }
    if (tone === "urgent") {
      return `Hi ${contactName},\n\nI noticed ${company} is growing fast in the ${lead.industry} sector. We have a limited-time opportunity to help you automate your lead generation before Q4.\n\nLet's connect tomorrow for 10 minutes.\n\nBest,\nSaaSquatch Team`;
    }
    // Professional (default)
    return `Dear ${contactName},\n\nI hope this email finds you well.\n\nI am reaching out because we have successfully helped other ${lead.industry} businesses like ${company} increase their efficiency by 40% using our AI solutions.\n\nI would love to schedule a brief introductory call next week to discuss how we might be able to add value to your operations.\n\nSincerely,\nSaaSquatch Team`;
  }

  if (templateType === "value_add") {
    return `Hi ${contactName},\n\nI came across an interesting report on the ${lead.industry} industry and immediately thought of ${company}.\n\nIt highlights some key challenges with automation that our platform directly solves. Let me know if you'd like me to send it over.\n\nBest,\nSaaSquatch Team`;
  }

  if (templateType === "follow_up") {
    return `Hi ${contactName},\n\nJust bubbling this up to the top of your inbox. Are you still interested in exploring AI solutions for ${company}?\n\nLet me know if you have 5 minutes this week.\n\nBest,\nSaaSquatch Team`;
  }

  return `Hello ${contactName},\n\nI would love to connect to discuss synergies between our companies.\n\nBest,\nSaaSquatch Team`;
}
