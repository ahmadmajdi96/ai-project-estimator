import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build dynamic system prompt with AI config and policies
    let personalityInstructions = '';
    let rulesInstructions = '';
    let policiesContext = '';

    if (context?.aiConfig?.personality) {
      personalityInstructions = `\n\nYour personality: ${context.aiConfig.personality}`;
    }

    if (context?.aiConfig?.rules && Array.isArray(context.aiConfig.rules) && context.aiConfig.rules.length > 0) {
      rulesInstructions = `\n\nYou must follow these rules:
${context.aiConfig.rules.map((rule: string, i: number) => `${i + 1}. ${rule}`).join('\n')}`;
    }

    if (context?.companyPolicies && context.companyPolicies.length > 0) {
      policiesContext = `\n\nCompany Policies and Rules (reference these when relevant):
${context.companyPolicies.map((p: any) => `- ${p.title} (${p.category}): ${p.content.substring(0, 200)}${p.content.length > 200 ? '...' : ''}`).join('\n')}`;
    }

    const systemPrompt = `You are an intelligent CRM assistant for an AI and software engineering company. You have full access to the organization's data and help users analyze business performance, identify opportunities, and make data-driven decisions.${personalityInstructions}${rulesInstructions}${policiesContext}

Current CRM Data Summary:
- Total Clients: ${context?.summary?.totalClients || 0} (${context?.summary?.activeClients || 0} active, ${context?.summary?.prospectClients || 0} prospects)
- Total Revenue: $${(context?.summary?.totalRevenue || 0).toLocaleString()}
- Total Contract Value: $${(context?.summary?.totalContractValue || 0).toLocaleString()}
- Tasks: ${context?.summary?.totalTasks || 0} total, ${context?.summary?.pendingTasks || 0} pending, ${context?.summary?.overdueTasks || 0} overdue
- Salesmen: ${context?.summary?.totalSalesmen || 0} total, ${context?.summary?.activeSalesmen || 0} active
- Quotes: ${context?.summary?.totalQuotes || 0} total, ${context?.summary?.acceptedQuotes || 0} accepted, ${context?.summary?.pendingQuotes || 0} pending
- Quotes Value: $${(context?.summary?.quotesValue || 0).toLocaleString()}
- Departments: ${context?.summary?.totalDepartments || 0}
- Roadmaps: ${context?.summary?.totalRoadmaps || 0}

Detailed Data:
${JSON.stringify({
  clients: context?.clients || [],
  tasks: context?.tasks || [],
  salesmen: context?.salesmen || [],
  quotes: context?.quotes || [],
  kpis: context?.kpis || [],
  roadmaps: context?.roadmaps || [],
  departments: context?.departments || [],
  upcomingEvents: context?.upcomingEvents || [],
}, null, 2)}

Response Guidelines:
- Be professional yet friendly
- Provide data-driven insights with specific numbers and percentages
- Use markdown formatting for better readability:
  - Use **bold** for important metrics and names
  - Use bullet points (- item) for lists
  - Use numbered lists (1. item) for steps or rankings
  - Use headers (## Header) for sections when appropriate
- Suggest actionable next steps
- Reference company policies when relevant to the discussion
- If asked about data not available, clearly state what information would be helpful
- Be concise but comprehensive`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
