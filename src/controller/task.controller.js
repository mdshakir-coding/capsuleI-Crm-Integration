import { fetchCapsuleEmailEntries } from "../service/service.js";
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
import { associateContactToTask } from "../service/hubspot.service.js";
import { associateTaskToCompany } from "../service/hubspot.service.js";
import { fetchCsvData } from "../utils/invoice.Helper.js";
import { mapNameToEmail } from "../utils/emailMapper.js";
import { getOwnerByEmail } from "../service/hubspot.service.js";
import { associateDealWithTask } from "../service/hubspot.service.js";


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

/*
// Function to sync tasks
async function syncTasks() {
  try {
    const tasks = await fetchTasks(); // Fetch from Capsule
    console.log("Task Entries Fetched:", tasks?.length);

    if (!tasks || tasks.length === 0) {
      console.log("No tasks found to sync.");
      return;
    }

    // Clean invalid tasks BEFORE starting
    // const validTasks = tasks.filter((t) => t && typeof t === "object");

    // console.log(`Valid Tasks after cleaning: ${validTasks.length}`);

    // Load progress
    let startIndex = loadProgress();

    // ❌ WRONG → opportunities is not defined
    // for (let i = startIndex; i < opportunities.length; i++) {

    // ✅ FIXED → loop through validTasks
    for (let i = startIndex; i < tasks.length; i++) {
      const task = tasks[i];

      if(task.id === 136280118) {
        console.log("Task ID:", task);
      }

      if (task.id !== 136280118) {
        // console.error(`❌ Skipping invalid task at index ${task.id}:`);
        // saveProgress(i + 1);
        continue;
      }

      // console.log(`\n🔄 Syncing Task ${i + 1}/${validTasks.length}`);
      console.log("Capsule Task ID:", task.id);

      try {

        // console.log("Proceesing task:",task); //todo remove this after testing
        // return;


        let companyId = null;
        let contactId = null;
        let tasksId = null;
        // Create HubSpot Task
        const result = await createHubSpotTask(task);
        console.log("✅ HubSpot Task Created:", result.id);

        // Save HubSpot task ID
        tasksId = result.id;

      

        // Fetch the Capsule Party
        const party = await fetchCapsuleParty(task.party?.id);
        console.log("Capsule Party Fetched:", party.id);

        // Search or create company
        let company = await searchCompanyByName(party?.organisation?.name);
        console.log("HubSpot Company Fetched:", company.id);
        companyId = company.id;

        if (!company) {
          const company = await createCompany(party?.organisation?.name);
          console.log("HubSpot Company Created:", company.id);
          companyId = company.id;
        }

        // Associate task → company
        if (tasksId && companyId) {
          const taskCompanyResult = await associateTaskToCompany(
            tasksId,
            companyId
          );
          console.log("Task → Company Associated:", taskCompanyResult);
        }

        // Loop through all party contacts
        for (const contact of party.emailAddresses) {
          try {
            let hubspotContact = await searchContactByEmail(contact.address);
            console.log("HubSpot Contact Fetched:", hubspotContact.id);
            contactId = hubspotContact.id;

            if (!hubspotContact) {
              hubspotContact = await createContactInHubSpot(contact);
              console.log("HubSpot Contact Created:", hubspotContact.id);
              contactId = hubspotContact.id;
            } else {
              console.log("HubSpot Contact Fetched:", hubspotContact.id);
            }

            // Associate contact → task
            if (contactId && tasksId) {
              const contactResult = await associateContactToTask(
                contactId,
                tasksId
              );
              console.log("Contact → Task Associated:", contactResult);
            }

            // Associate contact → company
            if (contactId && companyId) {
              const companyResult = await associateContactCompany(
                contactId,
                companyId
              );
              console.log("Contact ↔ Company Associated:", companyResult);
            }
          } catch (err) {
            console.error(
              "❌ Error creating HubSpot contact:",
              err.response?.data || err.message
            );
          }
        }

        

        // Save progress
        saveProgress(i + 1);
        console.log ("testing");
        return; //todo remove after testing

        // Throw only for testing
        // throw new Error("Testing error stop");
      } catch (err) {
        console.error(
          "❌ Error creating HubSpot task:",
          err.response?.data || err.message
        );

        saveProgress(i);
        // break; //todo remove 
      }
    }

    console.log("🎉 All tasks synced successfully!");

    // Throw only for testing
    // throw new Error("Testing error stopping");
  } catch (error) {
    console.error("❌ syncTasks() failed:", error.message);
    return;
  }
}
  */

//old code

async function syncTasks() {
  try {
    const tasks = await fetchTasks(); // Fetch Task from Capsule
    console.log("Task Entries Fetched:", tasks?.length);

    if (!tasks || tasks.length === 0) {
      console.log("No tasks found to sync.");
      return;
    }

    // Clean invalid tasks BEFORE starting
    const validTasks = tasks.filter((t) => t && typeof t === "object");

    console.log(`Valid Tasks after cleaning: ${validTasks.length}`);
    

    // Load progress
    let startIndex = loadProgress();

    // ❌ WRONG → opportunities is not defined
    // for (let i = startIndex; i < opportunities.length; i++) {

    // ✅ FIXED → loop through validTasks
    for (let i = startIndex; i < validTasks.length; i++) {
      const task = validTasks[i];

      // todo task id search loop
      // if (task.id === 153310321) {
      //   console.log("Task ID:", task);
      // }

      if (task.id !== 155426529) {
        // console.error(`❌ Skipping invalid task at index ${task.id}:`);
        // saveProgress(i + 1);
        continue;
      }

      console.log("Proceesing task:",task); //todo remove this after testing
      // return; // todo remove after testing


      console.log(`\n🔄 Syncing Task ${i + 1}/${validTasks.length}`);
      console.log("Capsule Task ID:", task.id);

      try {
      
        let companyId = null;
        let contactId = null;
        let tasksId = null;
        let ownerId = null;
        let dealId = null;

        // search existing deal by source id
        const existingDeal = await searchDealBySourceId(task.opportunity?.id);
        console.log("Existing Deal:", existingDeal);
        dealId = existingDeal?.id || null;

        // ceate owner name by email
        const ownerNameStr = task.owner?.name;
        const ownerEmail = mapNameToEmail(ownerNameStr);
        console.log("Owner Email:", ownerEmail);
        // search based on email from hubsopt , use owner id in hubspot create task

        const owner = await getOwnerByEmail(ownerEmail);
        console.log("Owner Fetched:", owner.id);
        ownerId = owner.id;

        if (!owner) {
          console.error(`❌ Skipping invalid task at index ${i}:`, ownerEmail);

          const ownerId = owner.id;
          console.log("Owner Fetched:", ownerId);
          continue;
        }

        // ownerName Add

        const ownerName = task.owner?.name;
        const ownerN = mapNameToEmail(ownerName);
        console.log("Owner Email:", ownerN);
        
        // console.log("👤 Task Owner Name:", ownerName);

        // Create HubSpot Task
        const result = await createHubSpotTask(task,ownerId,ownerName);
        console.log("✅ HubSpot Task Created:", result.id);

        // Save HubSpot task ID
        tasksId = result.id;


        // Associate taskId to dealId

        if (tasksId && dealId) {
          console.log("Task ID:", tasksId);
          console.log("Deal ID:", dealId);
          const dealTaskResult = await associateDealWithTask(tasksId, dealId);
          // tasksId = dealTaskResult.id;

          console.log("Deal → Task Associated:", dealTaskResult);
        }


        if (!task.party?.id) {
          console.error(`❌ Skipping invalid task at index ${i}:`, task);
          continue;
        }

        // Fetch the Capsule Party
        const party = await fetchCapsuleParty(task.party?.id);
        console.log("Capsule Party Fetched:", party.id);

        // console.log("Party Organisation Name:", party?.name);
        // return;

        // Search or create company
        let company = await searchCompanyByName(party?.name);

        console.log("HubSpot Company Fetched:", company.id);
        companyId = company.id;

        if (!company) {
          const company = await createCompany(party?.name);
          console.log("HubSpot Company Created:", company.id);
          companyId = company.id;
        }
        
        
        // Associate task → company
        if (tasksId && companyId) {
          const taskCompanyResult = await associateTaskToCompany(
            tasksId,
            companyId
          );
          console.log("Task → Company Associated:", taskCompanyResult);
        }

        // Loop through all party contacts
        for (const contact of party.emailAddresses) {
          try {
            let hubspotContact = await searchContactByEmail(contact.address);
            console.log("HubSpot Contact Fetched:", hubspotContact.id);
            contactId = hubspotContact.id;

            if (!hubspotContact) {
              hubspotContact = await createContactInHubSpot(contact);
              console.log("HubSpot Contact Created:", hubspotContact.id);
              contactId = hubspotContact.id;
            } else {
              console.log("HubSpot Contact Fetched:", hubspotContact.id);
            }
            // Associate contact → task
            if (contactId && tasksId) {
              const contactResult = await associateContactToTask(
                contactId,
                tasksId
              );
              console.log("Contact → Task Associated:", contactResult);
            }

            // Associate contact → company
            if (contactId && companyId) {
              const companyResult = await associateContactCompany(
                contactId,
                companyId
              );
              console.log("Contact ↔ Company Associated:", companyResult);
            }
          } catch (err) {
            console.error(
              "❌ Error creating HubSpot contact:",
              err.response?.data || err.message,
              
            );
          }
        }
        return; //todo remove after testing
        // Save progress
        saveProgress(i + 1);
      } catch (err) {
        console.error(
          "❌ Error creating HubSpot task:",
          err.response?.data || err.message
        );

        saveProgress(i);
      }
    }

    console.log("🎉 All tasks synced successfully!");

  } catch (error) {
    console.error("❌ syncTasks() failed:", error.message);
    return;
  }
}

export { syncTasks };
