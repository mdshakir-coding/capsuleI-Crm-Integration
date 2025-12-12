import axios, { all } from "axios";
import { cleanProps } from "../utils/helper.js";

// Fetch Capsule Tasks
async function fetchCapsuleTasks(page = 1, perPage = 100) {
  try {
    const url = `https://api.capsulecrm.com/api/v2/tasks?page=${page}&perPage=${perPage}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.CAPSULE_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    // console.log("Fetched Tasks:", response.data);
    return response.data.tasks;
  } catch (error) {
    console.error(
      "Error fetching Capsule tasks:",
      error.response?.data || error.message
    );
    return null;
  }
}

// Fetch Capsule Email Entries

//Add pagination Logic
async function fetchCapsuleEmailEntries(perPage = 100) {
  let page = 1;
  let allEmails = [];

  try {
    while (true) {
      const url = `https://api.capsulecrm.com/api/v2/entries?type=email&page=${page}&perPage=${perPage}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.CAPSULE_API_TOKEN}`,
          Accept: "application/json",
        },
      });

      const emailEntries = response.data.entries || [];

      console.log(`Fetched page ${page}, entries: ${emailEntries.length}`);

      allEmails.push(...emailEntries);
      return allEmails; //todo remove after testing

      // Capsule returns empty array when no more records
      if (emailEntries.length < perPage) {
        break;
      }

      page++;
    }

    console.log(`Total email entries fetched: ${allEmails.length}`);
    return allEmails;
  } catch (error) {
    console.error(
      "Error fetching email entries:",
      error.response?.data || error.message
    );
    return allEmails; // Return what was fetched before error
  }
}

async function fetchOpportunities() {
  const allOpportunities = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const response = await axios.get(
        "https://api.capsulecrm.com/api/v2/opportunities",
        {
          params: { page, perPage },
          headers: {
            Authorization: `Bearer ${process.env.CAPSULE_API_TOKEN}`,
            Accept: "application/json",
          },
        }
      );

      const opportunities = response.data.opportunities || [];

      if (!opportunities || opportunities.length === 0) {
        break;
      }

      // console.log("Not filtered:", opportunities.length);
      // console.log("Sample opportunity milestone:", opportunities[0].milestone);

      // ⭐ Correct Capsule filtering using milestone.name
      const filtered = opportunities.filter((op) => {
        const milestone = op.milestone?.name?.toLowerCase() || "";

        const isClosedWon = milestone === "won";
        const isClosedLost = milestone === "lost";
        const isOpen = milestone !== "won" && milestone !== "lost";

        // IMPORT → OPEN + CLOSED-LOST
        // DO NOT IMPORT → CLOSED-WON
        return (isOpen || isClosedLost) && !isClosedWon;
      });

      // console.log("Filtered (OPEN + CLOSED-LOST):", filtered.length);

      allOpportunities.push(...filtered);

      // if (allOpportunities.length > 0) return allOpportunities; //todo: remove

      if (opportunities.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(
        "Error fetching opportunities:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  // console.log(
  //   `Total Opportunities after filtering (OPEN + CLOSED-LOST): ${allOpportunities.length}`
  // );

  return allOpportunities;
}



async function createDeal(opportunity) {
  try {
    // return; // todo: remove

    // -----------------------------
    // 1. Stage Mapping (Capsule → HubSpot)
    // -----------------------------
    const stageMap = {
      Lost: "closedlost",
      Won: "closedwon",
      Prospect: "appointmentscheduled",
      Proposal: "qualifiedtobuy",
    };

    const safeDescription =
      typeof opportunity.description === "string"
        ? opportunity.description
        : opportunity.description?.content || "";

    const safeCloseDate = opportunity.expectedCloseOn
      ? new Date(opportunity.expectedCloseOn).getTime()
      : null;

    const payload = {
      properties: cleanProps({
        dealname: opportunity.name || "",
        sourceid: opportunity.id,
        description: safeDescription,
        // lost_reason: opportunity.lostReason || "",
        amount: opportunity.value?.amount || 0,
        closedate: safeCloseDate,

        pipeline: "default",
        dealstage: null,
        capsule_stage: opportunity.milestone?.name || "",
      }),
    };

    // const payload = {
    //   properties: {
    //     dealname: opportunity.name || "",
    //     sourceid: opportunity.id,
    //     description: safeDescription,
    //     lost_reason: opportunity.lostReason || "",
    //     amount: opportunity.value?.amount || 0,
    //     closedate: safeCloseDate,

    //     pipeline: "default",
    //     dealstage: null,   // or proper stage
    //     capsule_stage: opportunity.milestone?.name || "",
    //   },
    // };

    console.log("Creating Deal with payload:", payload);

    // -----------------------------
    // 3. HubSpot API Call
    // -----------------------------
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/deals",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );

    console.log("Deal Created Successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error Creating Deal:",
      error.response?.data || error.message
    );
    return {};
  }
}

// ----------------------------------
// 4. Debug Mode — Optional
// ----------------------------------
if (process.env.DEBUG_MODE === "true") {
  throw new Error("deal Testing");
}



// fetch Tasks with pagination

async function fetchTasks() {
  let page = 1;
  const perPage = 100;

  let allTasks = [];
  let hasMore = true;

  try {
    
    while (hasMore) {
      const response = await axios.get(
        "https://api.capsulecrm.com/api/v2/tasks",
        {
          params: { page, perPage },
          headers: {
            Authorization: `Bearer ${process.env.CAPSULE_API_TOKEN}`,
            Accept: "application/json",
          },
        }
      );

      const tasks = response.data.tasks || [];

      console.log(`Fetched Page ${page} → ${tasks.length} tasks`);

      // Add to master array
      allTasks.push(...tasks);
      return allTasks;

      // If less than perPage, it's the last page
      if (tasks.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allTasks;
  } catch (error) {
    console.error(
      "Error fetching tasks:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// fetch capsule party id

async function fetchCapsuleParty(partyId) {
  const url = `https://api.capsulecrm.com/api/v2/parties/${partyId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.CAPSULE_API_TOKEN}`,
        Accept: "application/json",
      },
    });

    console.log("Capsule Party Fetched:", response.data.party);


    return response.data.party;

  } catch (error) {
    console.error("❌ Error fetching Capsule party:", error.response?.data || error.message);
    throw error;
  }
}






export {
  fetchCapsuleTasks,
  fetchCapsuleEmailEntries,
  fetchOpportunities,
  createDeal,
  fetchTasks,
  fetchCapsuleParty,
};
