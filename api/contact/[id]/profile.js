const axios = require("axios");

module.exports = async (req, res) => {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id: contactId } = req.query; // Get dynamic path param
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

    const result = {
      contactId,
      recent_conversion_event_name: recentConversion,
      medicare_expiry_date: medicareExpiry,
      form_submissions: formSubmissions,
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ HubSpot API Error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch contact profile" });
  }
};
