function cleanProps(obj) {
  const cleaned = {};

  for (const key in obj) {
    const value = obj[key];

    // Skip undefined
    if (value === undefined) continue;

    // Allow null (HubSpot accepts null for some fields)
    if (value === null) {
      cleaned[key] = null;
      continue;
    }

    // Allow strings and numbers directly
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      cleaned[key] = value;
      continue;
    }

    // If it's an object and has `.toString()`
    if (typeof value === "object") {
      // Capsule rich text: { content: "xxx" }
      if (value.content && typeof value.content === "string") {
        cleaned[key] = value.content;
        continue;
      }

      // Date object → convert to timestamp
      if (value instanceof Date) {
        cleaned[key] = value.getTime();
        continue;
      }

      // Otherwise fallback → JSON string
      cleaned[key] = JSON.stringify(value);
      continue;
    }

    // Everything else → convert to string
    cleaned[key] = String(value);
  }

  return cleaned;
}

// Create Notes Payload in Hubspot

function buildHubSpotNotePayload(data = {}) {
  function toEpochMs(dateStr) {
    return dateStr ? new Date(dateStr).getTime() : Date.now();
  }

  console.log("Raw note input data:", data);

  const properties = {
    hs_note_body: data.hs_note_body || "Default note body",
    hs_timestamp: toEpochMs(data.hs_timestamp || data.created_at || null), // required
    
  };

  return {
    properties: cleanProps(properties),
  };
}

















export { cleanProps,buildHubSpotNotePayload};
