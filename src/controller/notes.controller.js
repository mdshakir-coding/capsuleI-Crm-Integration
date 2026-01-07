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
import { fetchNotes } from "../service/service.js";
import { createHubSpotNote } from "../service/hubspot.service.js";
import { updateHubSpotNote } from "../service/hubspot.service.js";
import { buildHubSpotNotePayload } from "../utils/helper.js";
import { fetchPartyById } from "../service/service.js";
import { associateNote } from "../service/hubspot.service.js";

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
    console.log("Notes Entries Fetched:", notes?.length);

    let startIndex = loadProgress();

    for (let i = startIndex; i < notes.length; i++) {
      try {
        // let companyid = null;
        let contactid = null;
        let dealId = null;
        let NotesId = null;

        const note = notes[i];

        if (note?.activityType?.name === "Note") {
          // console.log("✅ Match found:", note);
        } else {
          continue;
        }

        // note id  testing logic
        if ((note?.id !== 466584186)) {
          // console.log("Processing note:", note);
          continue;
        } // todo uncomment

        console.log("✅ Match found:", note);
        // return;

        const payload = buildHubSpotNotePayload(note); // call the function for payload

        console.log(" Notes", notes);
        console.log("Payloads", payload);

        // return; // todo remove after testing
        // create  Notes in hubspot
        const create = await createHubSpotNote(payload);
        NotesId = create?.id;
        console.log("✅ Notes created", NotesId);
        // return; // todo remove after testing

        // fetch deal from hubspot
        const existingDeal = await searchDealBySourceId(note.opportunity?.id);
        console.log("Existing Deal:", existingDeal);
        dealId = existingDeal?.id || null;

        // party fetch by id
        const partyId = note?.party?.id;

        const party = await fetchPartyById(partyId);
        // console.log("🎯 Party fetched:", party);
        // return;

        let companyid = null;

        // Search company by name
        const company = await searchCompanyByName(party?.name);
        console.log("Company Fetched:", company);

        // Create company if not exists
        if (!company) {
          const newcompany = await createCompany(party?.name);
          console.log("Company Created:", newcompany);
          companyid = newcompany.id;
        } else {
          companyid = company.id;
        }

        // ✅ Associate NOTE with Company
        if (NotesId && companyid) {
          console.log("🔋noteId", NotesId);
          console.log("🔋companyid", companyid);

          const noteCompanyResult = await associateNote(NotesId, companyid);
          console.log("Note Associated with Company", noteCompanyResult);
        }

        // Associated company with dealId //todo

        if (dealId && companyid) {
          console.log("🔋companyid", companyid);
          console.log("🔋dealId", dealId);

          const contactResult = await associateDealToCompany(dealId, companyid);

          console.log("Contact Associated with Company", contactResult);
        }

        // Association conatact with deal

        if (contactid && dealId) {
          console.log("🔋contactid", contactid);
          console.log("🔋dealId", dealId);

          const contactResult = await associateContactDeal(contactid, dealId);
          console.log("Contact Associated with Deal", contactResult);
        }

        // 🔁 Loop through contacts
        for (const contact of party.emailAddresses) {
          try {
            let contactid = null;

            let hubspotContact = await searchContactByEmail(contact.address);

            if (!hubspotContact) {
              hubspotContact = await createContactInHubSpot(contact);
              console.log("HubSpot Contact Created:", hubspotContact.id);
            } else {
              console.log("HubSpot Contact Fetched:", hubspotContact.id);
            }

            contactid = hubspotContact.id;

            // Assocaition conatact with company

            if (contactid && companyid) {
              console.log("🔋contactid", contactid);
              console.log("🔋companyid", companyid);

              const companyResult = await associateContactCompany(
                contactid,
                companyid
              );
              console.log("Contact Associated with Company", companyResult);
            }

            // Associate note to deal id

            if (NotesId && dealId) {
              console.log("🔋noteId", NotesId);
              console.log("🔋dealId", dealId);

              const result = await associateNote(noteId, "deals", dealId);
              console.log("✅ Note Associated with Deal", result);
            }

            // Associate note to contact id
            if (NotesId && contactid) {
              console.log("🔋noteId:", NotesId);
              console.log("🔋contactId:", contactid);

              const result = await associateNote(NotesId, contactid);
              console.log("✅ Note Associated with Contact", result);
            }
          } catch (err) {
            console.error("Error processing contact:", contact.address, err);
          }
        }

        // throw new Error("testing Ok"); //todo remove
        // }

        // Save progress after successful processing
        // saveProgress(i + 1);
        return;
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

// async function syncNotes() {
//   try {
//     const notes = await fetchNotes();
//     console.log("Notes Entries Fetched:", notes?.length);

//     let startIndex = loadProgress();

//     for (let i = startIndex; i < notes.length; i++) {
//       try {
//         let companyid = null;
//         let contactid = null;
//         let dealId = null;
//         let NotesId = null;

//         const note = notes[i];

//         if (note?.activityType?.name !== "Note") continue;

//         console.log("✅ Match found:", note.id);

//         // ✅ FIX: pass single note
//         const payload = buildHubSpotNotePayload(note);

//         const createdNote = await createHubSpotNote(payload);
//         NotesId = createdNote?.id;
//         console.log("📝 Note Created:", NotesId);

//         if (!NotesId) continue;

//         // Fetch party
//         const partyId = note?.party?.id;
//         if (!partyId) continue;

//         const party = await fetchPartyById(partyId);
//         if (!party) continue;

//         /* =========================
//            ORGANISATION
//         ========================== */
//         if (party.type === "organisation") {
//           let company = await searchCompanyByName(party.name);

//           if (!company || !company.id) {
//             company = await createCompany(party.name);
//             console.log("🏢 Company Created:", company.id);
//           }

//           companyid = company.id;

//           // 🔗 Note → Company
//           if (NotesId && companyid) {
//             await associateNote(NotesId, "companies", companyid);
//           }

//           for (const email of party.emailAddresses || []) {
//             let hubspotContact = await searchContactByEmail(email.address);

//             if (!hubspotContact || !hubspotContact.id) {
//               hubspotContact = await createContactInHubSpot({
//                 email: email.address
//               });
//               console.log("👤 Contact Created:", hubspotContact.id);
//             }

//             contactid = hubspotContact.id;

//             // 🔗 Note → Contact
//             if (NotesId && contactid) {
//               await associateNote(NotesId, "contacts", contactid);
//             }

//             // optional existing associations
//             if (contactid && companyid) {
//               await associateContactCompany(contactid, companyid);
//             }
//           }
//         }

//         /* =========================
//            PERSON
//         ========================== */
//         if (party.type === "person") {
//           const orgName = party.organisation?.name;
//           if (!orgName) continue;

//           let company = await searchCompanyByName(orgName);

//           if (!company || !company.id) {
//             company = await createCompany(orgName);
//           }

//           companyid = company.id;

//           // 🔗 Note → Company
//           if (NotesId && companyid) {
//             await associateNote(NotesId, "companies", companyid);
//           }

//           for (const email of party.emailAddresses || []) {
//             let hubspotContact = await searchContactByEmail(email.address);

//             if (!hubspotContact || !hubspotContact.id) {
//               hubspotContact = await createContactInHubSpot({
//                 email: email.address
//               });
//             }

//             contactid = hubspotContact.id;

//             // 🔗 Note → Contact
//             if (NotesId && contactid) {
//               await associateNote(NotesId, "contacts", contactid);
//             }

//             if (contactid && companyid) {
//               await associateContactCompany(contactid, companyid);
//             }
//           }
//         }

//         // 🔗 Note → Deal (if you add deal logic later)
//         if (NotesId && dealId) {
//           await associateNote(NotesId, "deals", dealId);
//         }

//         // saveProgress(i + 1);
//       } catch (err) {
//         console.error("❌ Error processing note:", err);
//       }
//     }

//     console.log("🎄 All Notes Processed");
//   } catch (error) {
//     console.error("❌ Error syncing notes:", error);
//   }
// }

export { syncNotes };
