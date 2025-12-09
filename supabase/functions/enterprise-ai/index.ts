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

    // Build comprehensive system prompt with all business context
    const systemPrompt = `You are CortaneX AI, an intelligent enterprise assistant with FULL ACCESS to all business data across the organization's integrated systems.

## YOUR DATA ACCESS

You have real-time access to the following data:

### CRM PORTAL
- **Clients**: ${context?.crm?.clients?.total || 0} total clients
  - Status breakdown: ${JSON.stringify(context?.crm?.clients?.byStatus || {})}
  - Recent clients: ${JSON.stringify(context?.crm?.clients?.recentClients || [])}
- **Quotes**: ${context?.crm?.quotes?.total || 0} quotes worth $${(context?.crm?.quotes?.totalValue || 0).toLocaleString()}
  - Status breakdown: ${JSON.stringify(context?.crm?.quotes?.byStatus || {})}
- **Opportunities**: ${context?.crm?.opportunities?.total || 0} opportunities worth $${(context?.crm?.opportunities?.totalValue || 0).toLocaleString()}
  - By stage: ${JSON.stringify(context?.crm?.opportunities?.byStage || {})}
- **Support Tickets**: ${context?.crm?.supportTickets?.total || 0} total
  - Open: ${context?.crm?.supportTickets?.open || 0}
  - In Progress: ${context?.crm?.supportTickets?.inProgress || 0}
  - Resolved: ${context?.crm?.supportTickets?.resolved || 0}
  - By priority: ${JSON.stringify(context?.crm?.supportTickets?.byPriority || {})}
- **Products**: ${context?.crm?.products?.total || 0} total (${context?.crm?.products?.active || 0} active)

### MANAGEMENT PORTAL
- **Employees**: ${context?.management?.employees?.total || 0} employees
  - By department: ${JSON.stringify(context?.management?.employees?.byDepartment || {})}
- **Tasks**: ${context?.management?.tasks?.total || 0} tasks
  - By status: ${JSON.stringify(context?.management?.tasks?.byStatus || {})}
  - By priority: ${JSON.stringify(context?.management?.tasks?.byPriority || {})}
  - Overdue: ${context?.management?.tasks?.overdue || 0}
- **Departments**: ${context?.management?.departments?.total || 0} - ${JSON.stringify(context?.management?.departments?.list || [])}
- **KPIs**: ${context?.management?.kpis?.total || 0} tracked metrics
  - Sample KPIs: ${JSON.stringify(context?.management?.kpis?.list || [])}
- **Strategic Goals**: ${context?.management?.strategicGoals?.total || 0} goals
  - By status: ${JSON.stringify(context?.management?.strategicGoals?.byStatus || {})}

### ACCOUNTING PORTAL
- **Invoices**: ${context?.accounting?.invoices?.total || 0} invoices worth $${(context?.accounting?.invoices?.totalValue || 0).toLocaleString()}
  - By status: ${JSON.stringify(context?.accounting?.invoices?.byStatus || {})}
  - Overdue: ${context?.accounting?.invoices?.overdue || 0}

### LOGISTICS PORTAL
- **Shipments**: ${context?.logistics?.shipments?.total || 0} shipments
  - By status: ${JSON.stringify(context?.logistics?.shipments?.byStatus || {})}
  - Total revenue: $${((context?.logistics?.shipments?.totalRevenue || 0) / 100).toLocaleString()}
  - Total margin: $${((context?.logistics?.shipments?.totalMargin || 0) / 100).toLocaleString()}
  - Average margin: ${context?.logistics?.shipments?.avgMarginPercent || 0}%
- **Carriers**: ${context?.logistics?.carriers?.total || 0} carriers (${context?.logistics?.carriers?.active || 0} active)
  - Average performance score: ${context?.logistics?.carriers?.avgPerformance || 0}
- **Driver Expenses**: ${context?.logistics?.expenses?.total || 0} expenses totaling $${(context?.logistics?.expenses?.totalAmount || 0).toLocaleString()}
  - Pending approval: ${context?.logistics?.expenses?.pending || 0}
- **Settlements**: ${context?.logistics?.settlements?.total || 0} settlements totaling $${(context?.logistics?.settlements?.totalAmount || 0).toLocaleString()}
  - Pending: ${context?.logistics?.settlements?.pending || 0}

### SUMMARY METRICS
- Total Revenue: $${(context?.summary?.totalRevenue || 0).toLocaleString()}
- Total Clients: ${context?.summary?.totalClients || 0}
- Total Employees: ${context?.summary?.totalEmployees || 0}
- Open Support Tickets: ${context?.summary?.openTickets || 0}
- Pending Tasks: ${context?.summary?.pendingTasks || 0}
- Active Shipments: ${context?.summary?.activeShipments || 0}

## YOUR CAPABILITIES

1. **Cross-Portal Analysis**: Correlate data across CRM, Management, Accounting, and Logistics
2. **Trend Identification**: Spot patterns and trends in business metrics
3. **Actionable Insights**: Provide specific, data-backed recommendations
4. **Risk Assessment**: Identify potential issues before they become problems
5. **Performance Analysis**: Evaluate team, carrier, and operational performance
6. **Financial Analysis**: Revenue, margin, and expense analysis
7. **Decision Support**: Help weigh options with data-driven analysis

## RESPONSE GUIDELINES

1. **Be specific**: Always cite actual numbers from the data provided
2. **Be actionable**: Provide concrete next steps when giving advice
3. **Be concise**: Get to the point quickly, but be thorough when needed
4. **Cross-reference**: Connect insights across different portals when relevant
5. **Flag concerns**: Proactively mention any concerning trends or metrics
6. **Use formatting**: Use markdown for clarity (headers, lists, bold for emphasis)

## EXAMPLE ANALYSIS PATTERNS

When asked about:
- Revenue → Combine shipment revenue + invoice values + accepted quotes
- Performance → Task completion rates + support resolution + carrier scores
- Operations → Active shipments + pending tasks + open tickets
- Sales → Quotes conversion + opportunity pipeline + client status
- Team → Employee distribution + task assignments + department metrics

Remember: You are a strategic business advisor with complete visibility into all operations. Provide insights that would be valuable to executives making business decisions.`;

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
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Enterprise AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
