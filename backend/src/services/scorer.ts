// Lead scoring service — calculates a lead score out of 100

export function scoreLead(lead: any): { score: number, score_tier: string, score_rationale: string } {
  let score = 0;
  const rationale: string[] = [];

  // Employee count (max 30 points)
  if (lead.employee_count) {
    if (lead.employee_count >= 100) {
      score += 30;
      rationale.push("Enterprise size (+30)");
    } else if (lead.employee_count >= 50) {
      score += 20;
      rationale.push("Mid-market size (+20)");
    } else if (lead.employee_count >= 10) {
      score += 10;
      rationale.push("Small business size (+10)");
    } else {
      score += 5;
      rationale.push("Micro business (+5)");
    }
  }

  // Estimated Revenue (max 30 points)
  if (lead.estimated_revenue) {
    if (lead.estimated_revenue >= 5000000) {
      score += 30;
      rationale.push("High revenue (+30)");
    } else if (lead.estimated_revenue >= 1000000) {
      score += 20;
      rationale.push("Medium revenue (+20)");
    } else if (lead.estimated_revenue >= 500000) {
      score += 10;
      rationale.push("Low-mid revenue (+10)");
    } else {
      score += 5;
      rationale.push("Low revenue (+5)");
    }
  }

  // Completeness/Enrichment (max 40 points)
  if (lead.is_enriched) {
    score += 15;
    rationale.push("Data enriched (+15)");
  }
  
  if (lead.linkedin_url) {
    score += 10;
    rationale.push("Has LinkedIn profile (+10)");
  }
  
  if (lead.owner_name) {
    score += 10;
    rationale.push("Contact person identified (+10)");
  }
  
  if (lead.website) {
    score += 5;
    rationale.push("Has website (+5)");
  }

  // Add random variability (+/- 5 points) to make scores look more organic
  const variability = Math.floor(Math.random() * 11) - 5;
  score = Math.max(1, Math.min(100, score + variability));

  let tier = "Cold";
  if (score >= 80) tier = "Hot";
  else if (score >= 50) tier = "Warm";

  return {
    score,
    score_tier: tier,
    score_rationale: rationale.join(", ")
  };
}
