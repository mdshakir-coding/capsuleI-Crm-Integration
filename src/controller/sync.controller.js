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

async function syncToHubspotasync() {
  try {
    // fetch capsule party id
    // const party = await fetchCapsuleParty("153576912");
    // console.log("Capsule Party Fetched:", party.id);
    // throw new Error("Testing error Ok ");

    // -------------------------------------------------------------------------------------------------------------------
   
    //

    // --------------------------------------------------------------------------------------------------------------------------

    // throw new Error("Error syncing to HubSpot:");

    // ---------------------------------------------------------------

    /* fetch Tasks from CapsuleCRM

    const tasks = await fetchTasks();
    console.log("Tasks Fetched:", tasks.length);

    for (const task of tasks) {
      try {
        
        console.log ("Processing Task:", task);
        throw new Error("Testing error Okay");
      
      } catch (error) {
        console.error("Error syncing task:", error);
        break;  
      }
    }
*/
    // -----------------------------------------------

    // const tasks = await fetchTasks(); // ✅ call the function properly
    // console.log("Task Entries Fetched:", tasks.length);

    // for (const task of tasks) {
    //   try {
    //     if (!task.party || !task.party.lastName) {
    //       continue;
    //     }
    //     console.log("Processing Task:", task);

    //     const email = task.party.lastName ; // Adjust based on actual task structure

    //     console.log("📧 Extracted Email:", email);
    //     // throw new Error("Testing error handling"); // Remove this line after testing

    //     // 2️⃣ Search HubSpot contact by email
    //     let contact = await searchContactByEmail(email);

    //     if (!contact) {
    //       console.log("⚠️ Contact not found → creating...");
    //       contact = await createContactInHubSpot(email);
    //       console.log("✔ Contact Created:", contact.id);
    //     }

    //     const contactId = contact.id;

    //     // 3️⃣ Prepare Email Engagement Data
    //     const emailData = {
    //       subject: task.description || "",
    //       body: task.detail || "",
    //       // status: "COMPLETED",
    //       direction: "INBOUND", // FIXED (Capsule tasks do NOT include direction)
    //     };

    //     // 4️⃣ Create Email Engagement
    //     const engagement = await createEmailEngagement(contactId, emailData);
    //     console.log("✔ Email engagement created:", engagement.id);

    //     // REMOVE THIS AFTER TESTING
    //     throw new Error("Testing error handling");
    //   } catch (error) {
    //     console.error("❌ Error syncing task:", error.message);
    //     break; // remove later
    //   }
    // }

    // ---------------------------------------------------------------

    // Example IDs (replace with real ones or pass to function)
    // const contactId = 123;
    // const dealId = 456;
    // const companyId = 789;

    // // 👉 DO NOT REDECLARE associateContactDeal again!!
    // const dealResult = await associateContactDeal(contactId, dealId);
    // console.log("Associate Contact with Deal Result:", dealResult);

    // throw new Error("Testing error handling"); // Example to test error handling

    // const companyResult = await associateContactCompany(contactId, companyId);
    // console.log("Associate Contact with Company Result:", companyResult);

    // // fetch opportunities logic here

    // -----------------------------------------------

    //----------------------------------------------------------------------------------------------------------------------------

    // fetch All Deal IDs logic here

    //   const opportunities = await fetchOpportunities();
    //   console.log("Fetched Opportunities:", opportunities.length);

    //   let startIndex = loadProgress();

    // for (let i = startIndex; i < opportunities.length; i++) {
    //   const opp = opportunities[i];
    //   console.log("Processing Opportunity ID:", opp.id);

    //   try {
    //     const dealResult = await createDeal(opp.id);
    //     console.log("Deal Created for Opportunity ID", opp.id, ":", dealResult);

    //     // Save progress after successful processing
    //     saveProgress(i + 1);

    //     // Remove throw after testing is complete
    //     // throw new Error("Testing ok ");

    //   } catch (error) {
    //     console.error("Error creating deal for Opportunity ID", opp.id, ":", error);

    //     // Save progress before exiting on error so you resume here next time
    //     saveProgress(i);
    //     break; // stop processing further
    //   }
    // }

    // console.log("🍀  All Opportunities Processed!");
    //-------------------------------------------------------------------------------------------------------------------------------

    // Associated dealid,conatctid,companyid

    
    //-----------------------------------------------------------------------------------------------------------------------------

    //-----------------------------------------------------------------------------------------------------------------------

    // ⭐ Add ID filter condition here ⭐
    // const targetId = 18523718;   // your sample ID

    // Find specific opportunity by ID
    // const match = opportunities.find(op => op.id === targetId);

    //   if (match) {
    //     console.log("Matched Opportunity:", match);
    //   } else {
    //   console.log(`No opportunity found with ID: ${targetId}`);
    // }

    // throw new Error("Testing ok "); // Example to test error handling
  } catch (error) {
    console.error("Error syncing to HubSpot:", opp.id, error);
    return;
  }
}

export { syncToHubspotasync };
