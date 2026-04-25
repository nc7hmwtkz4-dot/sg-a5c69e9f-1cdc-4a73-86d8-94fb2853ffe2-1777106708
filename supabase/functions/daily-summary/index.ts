import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_EMAIL")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get observations from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: observations, error } = await supabase
      .from("observations")
      .select(`
        *,
        cars!inner(brand, model, car_types(name))
      `)
      .gte("created_at", yesterday.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching observations:", error);
      throw error;
    }

    // If no new observations, don't send email
    if (!observations || observations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No new observations in the last 24 hours" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format email HTML
    const rarityNames = ["Stock", "Basique", "Pro", "Sportif", "Competitif", "Elite", "Extreme", "Ultime"];
    
    const observationsHtml = observations.map((obs) => {
      const partsHtml = obs.parts
        .map((rarity: number, index: number) => 
          rarity > 0 ? `Pièce ${index + 1}: ${rarityNames[rarity]}` : null
        )
        .filter(Boolean)
        .join("<br>");

      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #f9fafb;">
          <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 18px;">
            ${obs.cars.brand} ${obs.cars.model}
          </h3>
          <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
            <strong>Type:</strong> ${obs.cars.car_types?.name || "N/A"}<br>
            <strong>Réputation:</strong> ${obs.reputation}<br>
            <strong>Prix Min observé:</strong> ${obs.price_min.toLocaleString()}€<br>
            ${partsHtml ? `<strong>Pièces:</strong><br>${partsHtml}<br>` : ""}
            <strong>Date:</strong> ${new Date(obs.created_at).toLocaleString("fr-FR")}
          </div>
        </div>
      `;
    }).join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Résumé quotidien Eco-Sim</title>
        </head>
        <body style="font-family: Inter, system-ui, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h1 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 28px; font-weight: 700;">
                Eco-Sim
              </h1>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
                Résumé quotidien des observations
              </p>
              
              <div style="background-color: #dbeafe; border-left: 4px solid #1e3a8a; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <strong style="color: #1e3a8a; font-size: 16px;">
                  ${observations.length} nouvelle${observations.length > 1 ? "s" : ""} observation${observations.length > 1 ? "s" : ""}
                </strong>
                <p style="margin: 4px 0 0 0; color: #1e40af; font-size: 14px;">
                  Ajoutée${observations.length > 1 ? "s" : ""} au cours des dernières 24 heures
                </p>
              </div>

              ${observationsHtml}

              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Alimenté par la communauté · © 2026 Eco-Sim
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Eco-Sim <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `📊 Résumé quotidien Eco-Sim - ${observations.length} nouvelle${observations.length > 1 ? "s" : ""} observation${observations.length > 1 ? "s" : ""}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const resendData = await resendResponse.json();
    console.log("Email sent successfully:", resendData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        observationsCount: observations.length,
        emailId: resendData.id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});