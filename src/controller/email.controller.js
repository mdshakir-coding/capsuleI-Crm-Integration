import {
  fetchCapsuleTasks,
  fetchCapsuleEmailEntries,
} from "../service/service.js";
import {
  associateContactDeal,
  associateContactCompany,
} from "../service/hubspot.service.js";
import { fetchOpportunities } from "../service/service.js";
import { createDeal } from "../service/service.js";
import { searchDealBySourceId } from "../service/hubspot.service.js";
import { searchContactByEmail } from "../service/hubspot.service.js";
import { createContactInHubSpot } from "../service/hubspot.service.js";
import { createEmailEngagement } from "../service/hubspot.service.js";
import { fetchTasks } from "../service/service.js";
import { createHubSpotTask } from "../service/hubspot.service.js";
import { fetchCapsuleParty } from "../service/service.js";
import { searchCompanyByName } from "../service/hubspot.service.js";
import { createCompany } from "../service/hubspot.service.js";
import { associateDealToCompany } from "../service/hubspot.service.js";

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { all } from "axios";

// Recreate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const progressFile = path.resolve(__dirname, "progress.json");

function saveProgress(index) {
  fs.writeFileSync(progressFile, JSON.stringify({ index }), "utf-8");
}

function loadProgress() {
  if (fs.existsSync(progressFile)) {
    try {
      const data = fs.readFileSync(progressFile, "utf-8");
      const obj = JSON.parse(data);
      return typeof obj.index === "number" ? obj.index : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

// Email fetching

async function syncEmails() {
  try {
    const emailEntries = await fetchCapsuleEmailEntries(); // ✅ call the function properly
    console.log("Email Entries Fetched:", emailEntries.length);

    let startIndex = loadProgress();

    // for (const entry of emailEntries) {
    for (let i = startIndex; i < emailEntries.length; i++) {
      try {
        const entry = emailEntries[i];
        // console.log("Processing entry:", entry);

        // 🔥 Determine email direction based on Capsule activityType
        let direction = "EMAIL"; // default

        if (entry.activityType?.name === "Email sent") {
          direction = "FORWARDED_EMAIL"; // Email sent
        } else if (entry.activityType?.name === "Email received") {
          direction = "INCOMING_EMAIL"; // Email received
        }

        const emailData = {
          subject: entry.subject || "",
          body: entry.content || "",
          direction: direction, // <-- Use mapped value
        };

        // console.log ("Email Data:", emailData);
        // throw new Error("Testing error");

        // 🔁 Process participants
        for (const participant of entry.participants) {
          try {
            console.log("Processing participant:", participant.id);

            const email = participant.address;
            if (!email) continue;

            let contact = await searchContactByEmail(email);

            if (!contact) {
              console.log("⚠ Contact not found → creating…");
              contact = await createContactInHubSpot(email);
              console.log("✔ Contact Created:", contact.id);
            }

            const contactId = contact.id;

            if (!contactId) continue;

            const cEmail = await createEmailEngagement(contactId, emailData);
            console.log("✔ Email engagement created:", cEmail.id);
          } catch (error) {
            console.error(
              "❌ Error processing participant:",
              error?.response?.data || error
            );
            // break; //todo  remove
          }
        }
        // throw new Error("Testing error");

        // Save progress after successful processing
        saveProgress(i + 1);
      } catch (error) {
        console.error("❌ Error processing email entry:", error);
        saveProgress(i);
        // break; //todo remove
      }
    }
    console.log("📧  All Email Processed");
  } catch (error) {
    console.error("❌ Error syncing emails:", error);
  }
}

export { syncEmails };
