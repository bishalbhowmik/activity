const axios = require("axios");

module.exports = async (req, res) => {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Correct way to get `id` from the path in Vercel dynamic API
  const contactId = req.url.split("/")[3]; // because URL is like: /api/contact/{id}/profile

  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!contactId) {
    return res.status(400).json({ error: "Missing contact ID" });
  }

  const contactUrl = `https://api.hubapi.com/contacts/v1/contact/vid/${contactId}/profile?property=recent_conversion_event_name&property=medicare_expiry_date&property=form-submissions`;

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(contactUrl, { headers });

    const props = response.data.properties || {};
    const recentConversion = props["recent_conversion_event_name"]?.value || "";
    const medicareExpiry = props["medicare_expiry_date"]?.value || "";
    const formSubmissions = response.data["form-submissions"] || [];

    res.status(200).json({
      contactId,
      recent_conversion_event_name: recentConversion,
      medicare_expiry_date: medicareExpiry,
      form_submissions: formSubmissions,
    });
  } catch (err) {
    console.error("❌ HubSpot API Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch contact profile" });
  }
};
