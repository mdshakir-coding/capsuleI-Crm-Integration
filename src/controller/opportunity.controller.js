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
import {updateDeal} from "../service/hubspot.service.js";

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

async function syncOpportunities() {
  try {
    console.log("Opputunity Running");
    const opportunities = await fetchOpportunities();
    // console.log("Fetched Opportunities:", opportunities.length);

    let startIndex = loadProgress();

    for (let i = startIndex; i < opportunities.length; i++) {
      const opp = opportunities[i];
      console.log("Processing Opportunity ID:", opp);

      try {
        let dealId = null;
        let companyid = null;
        let contactid = null;

        const existingDeal = await searchDealBySourceId(opp.id);
        console.log("Existing Deal:", existingDeal);
        dealId = existingDeal.id;

        // console.log("Existing Deal:", existingDeal);

        if (!existingDeal) {
          const newDeal = await createDeal(opp);
          console.log("Deal Created for deal", newDeal);
          dealId = newDeal.id;
        }

        const party = await fetchCapsuleParty(opp.party.id);
        // console.log("Capsule Party Fetched:", party);
        // console.log = await fetchCapsuleParty(opp.party.id);
        // throw new Error("Testing error handling");

        if (party.type === "organisation") {
          // comapany search by organisation
          const company = await searchCompanyByName(party.name);
          console.log("Company Fetched:", company);

          companyid = company.id;

          // create comapny if not exist in hubspot

          if (!company) {
            const newcompany = await createCompany(party.name);
            console.log("company.Created", newcompany);
            companyid = newcompany.id;
          }
          // Associated company with dealId //todo

          // if (dealId && companyid) {
          //   console.log("🔋companyid", companyid);
          //   console.log("🔋dealId", dealId);

          //   const contactResult = await associateDealToCompany(
          //     dealId,
          //     companyid
          //   );

          //   console.log("Contact Associated with Company", contactResult);
          // }

          // serach contact by email , and used loop here

          for (const contact of party.emailAddresses) {
            try {
              let hubspotContact = await searchContactByEmail(contact.address);
              console.log("HubSpot Contact Fetched:", hubspotContact.id);
              contactid = hubspotContact.id;

              if (!hubspotContact) {
                hubspotContact = await createContactInHubSpot(contact);
                console.log("HubSpot Contact Created:", hubspotContact.id);
                contactid = hubspotContact.id;
              }
              // Assocaition conatact with deal and company

              // if (contactid && companyid) {
              //   console.log("🔋contactid", contactid);
              //   console.log("🔋companyid", companyid);

              //   const companyResult = await associateContactCompany(
              //     contactid,
              //     companyid
              //   );
              //   console.log("Contact Associated with Company", companyResult);
              // }

              // if (contactid && dealId) {
              //   console.log("🔋contactid", contactid);
              //   console.log("🔋dealId", dealId);

              //   const contactResult = await associateContactDeal(
              //     contactid,
              //     dealId
              //   );
              //   console.log("Contact Associated with Deal", contactResult);
              // }
            } catch (err) {
              console.error("Error processing contact:", email, err);
            }
          }

          // throw new Error("testing Ok"); //todo remove
        }

        // create person if not exist in hubsopt

        if (party.type === "person") {
          const company = await searchCompanyByName(party.organisation.name);
          console.log("Company Fetched:", company);

          companyid = company.id;

          // create comapny if not exist in hubspot
          if (!company) {
            const newcompany = await createCompany(party.organisation.name);
            console.log("company.Created", newcompany);
            companyid = newcompany.id;
          }

          // Assoicated deal with company //todo

          if (dealId && companyid) {
            console.log("🔋dealId", dealId);
            console.log("🔋companyid", companyid);

            const contactResult = await associateDealToCompany(
              dealId,
              companyid
            );
            console.log("Contact Associated with Company", contactResult);
          }

          // serach contact by email, and used loop here

          for (const contact of party.emailAddresses) {
            try {
              let hubspotContact = await searchContactByEmail(contact.address);
              console.log("HubSpot Contact Fetched:", hubspotContact.id);
              contactid = hubspotContact.id;

              if (!hubspotContact) {
                hubspotContact = await createContactInHubSpot(contact);
                console.log("HubSpot Contact Created:", hubspotContact.id);
                contactid = hubspotContact.id;
              }
              // Assocaition conatact with deal and company

              if (contactid && companyid) {
                console.log("🔋contactid", contactid);
                console.log("🔋companyid", companyid);

                const companyResult = await associateContactCompany(
                  contactid,
                  companyid
                );
                console.log("Contact Associated with Company", companyResult);
              }

              if (contactid && dealId) {
                console.log("🔋contactid", contactid);
                console.log("🔋dealId", dealId);

                const contactResult = await associateContactDeal(
                  contactid,
                  dealId
                );
                console.log("Contact Associated with Deal", contactResult);
              }
            } catch (err) {
              console.error("Error processing contact:", email, err);
            }
          }
        }

        saveProgress(i + 1);

        // throw new Error("Testing Ok");
        // return;
      } catch (error) {
        console.error("❌ Error processing opportunity:", opp.id, error);
        saveProgress(i);
        // break; //todo remove
      }
    }

    console.log("🍀 All Opportunities Processed!");
  } catch (error) {
    console.error("Error syncng opportunity:", error);
  }
}

export { syncOpportunities };
