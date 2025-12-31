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
import {fetchNotes} from '../service/service.js'
import{createHubSpotNote} from '../service/hubspot.service.js'
import{updateHubSpotNote} from '../service/hubspot.service.js'
import{buildHubSpotNotePayload} from '../utils/helper.js';



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


async function syncNotes() {


try {


 const notes = await fetchNotes(); // Fetch Notes from Capsule
    console.log("Task Entries Fetched:", notes?.length);

    if (!notes || notes.length === 0) {
    console.log("No notes found to sync.");
    return;
    }

let startIndex = loadProgress();

    for (let i = startIndex; i < notes.length; i++) {
      try {
        const note = notes[i];

        let NotesId = null;

        const payload  = buildHubSpotNotePayload(notes); // call the function for payload 

        console.log(" Notes", notes);
        console.log("Payloads", payload);

        // return; // todo remove after testing
        // create  Notes in hubspot
        const create = await createHubSpotNote(payload);
        NotesId = create?.id || null;
        console.log("✅ Notes created", NotesId);
        return; // todo remove after testing
    
    

        // Save progress after successful processing
        // saveProgress(i + 1);
      } catch (error) {
        console.error(error);
        // saveProgress(i);
        // break; // todo remove after testing
      }
    }

    console.log("🎄 All Notes Processed");
  } catch (error) {
    console.error("Error Fecting Inquirer Records", error);
    return;
  }
}



export { syncNotes };
