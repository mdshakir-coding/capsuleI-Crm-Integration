import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { cleanProps } from "../utils/helper.js";

// Associate Contact with Deal
async function associateContactCompany(contactId, companyId) {
  try {
    const url = `https://api.hubapi.com/crm/v3/associations/contact/company/batch/create`;

    const payload = {
      inputs: [
        {
          from: { id: contactId },
          to: { id: companyId },
          type: "contact_to_company",
        },
      ],
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Contact ↔ Company Associated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error associating contact with company:",
      error?.response?.data || error
    );

    return {
      success: false,
      error: error?.response?.data || error,
    };
  }
}

// Associate Contact with Company

// async function associateContactDeal( contactId, dealId) {
//   try {
//     const url = `https://api.capsulecrm.com/api/v2/parties/${partyId}/opportunities/${opportunityId}`;

//     const response = await axios.post(
//       url,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return {
//       success: true,
//       message: "Contact successfully associated with deal",
//       data: response.data,
//     };
//   } catch (error) {
//     console.error("❌ Error associating Contact with Deal:", error?.response?.data || error);

//     return {
//       success: false,
//       error: error?.response?.data || error,
//     };
//   }
// }

// async function associateContactDeal(contactId, dealId) {
//   try {
//     const url = `https://api.capsulecrm.com/api/v2/parties/${contactId}/opportunities/${dealId}`;

//     const response = await axios.post(
//       url,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
//           Accept: "application/json",
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error(
//       "❌ Error associating contact with deal:",
//       error?.response?.data || error)
//   }

//   return {};
// }
//new code

async function associateContactDeal(contactId, dealId) {
  if (!contactId || !dealId) return {};
  try {
    const baseUrl = process.env.HUBSPOT_BASE_URL || "https://api.hubapi.com";

    const url = `${baseUrl}/crm/v3/associations/contact/deal/batch/create`;

    const payload = {
      inputs: [
        {
          from: { id: contactId },
          to: { id: dealId },
          type: "contact_to_deal",
        },
      ],
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Contact → Deal associated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error associating contact with deal:",
      error?.response?.data || error
    );
  }
}

// Search Deal by Source ID

async function searchDealBySourceId(sourceId) {
  if (!sourceId) return {};

  try {
    const url = "https://api.hubapi.com/crm/v3/objects/deals/search";

    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "sourceid",
              operator: "EQ",
              value: sourceId,
            },
          ],
        },
      ],
      properties: [
        "dealname",
        "sourceid",
        "amount",
        "pipeline",
        "dealstage",
        "description",
      ],
      limit: 10,
      after: 0,
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
      },
    });

    return response.data.results[0];
  } catch (error) {
    console.error(
      "Error searching deal by sourceid:",
      error.response?.data || error.message
    );
    return {};
  }
}

// Example usage:
// searchDealBySourceId("5948655").then(result => console.log(result));

// Search Contact by Email

async function searchContactByEmail(email) {
  try {
    if (!email) return {};

    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        properties: ["firstname", "lastname", "email", "phone"],
        limit: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );

    return response.data.results[0] || {};
  } catch (error) {
    console.error("Error searching contact:", error.response?.data || error);
    return {};
  }
}

// Create Contact in HubSpot

async function createContactInHubSpot(email) {
  if (!email) return {};
  try {
    const payload = {
      properties: {
        email: email,
      },
    };

    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );
    return response.data || {};
  } catch (error) {
    console.error(
      "Error creating contact:",
      error.response?.data || error.message
    );
    return {};
  }
}

// create email engagement

async function createEmailEngagement(contactId, emailData, fromData, toData) {
  if (!contactId || !emailData || !fromData || !toData) return {};

  const nameParts = fromData.name.trim().split(" ");

  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  try {
    const payload = {
      engagement: {
        type: "EMAIL",
        timestamp: emailData.timestamp || Date.now(),
      },

      associations: {
        contactIds: [contactId],
      },

      metadata: {
        from: {
          // id: fromData.id,
          email: fromData.address,
          firstName: firstName,
          lastName: lastName,
        },

        to: [
          {
            email: toData.address,
          },
        ],

        subject: emailData.subject || "",
        text: emailData.body || "",
      },
    };

    // console.log(`to data ${JSON.stringify(toData.address)}`);

    const response = await axios.post(
      "https://api.hubapi.com/engagements/v1/engagements",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log("Email engagement created:", JSON.stringify(response.data.metadata.to));

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating EMAIL engagement (v1):",
      error.response?.data || error.message
    );
    return {};
  }
}

// create hubspot to task
// async function createHubSpotTask(taskData) {

//   const url = "https://api.hubapi.com/crm/v3/objects/tasks";

//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
//   };

//   const payload = {
//       properties: {
//         hs_task_subject: taskData.category?.name,
//         hs_task_body: taskData.description,
//         hs_task_status: taskData.status === "OPEN" ? "NOT_STARTED" : "COMPLETED",
//         hs_task_priority: "MEDIUM",
//         hs_timestamp: taskData.dueOn
//       ? `${taskData.dueOn}T09:00:00Z`
//           : new Date().toISOString()
//     },
//   };

//         // hs_task_status: taskData.status === "OPEN" ? "NOT_STARTED" : "COMPLETED",

//   console.log(payload);

//   // return; //todo remove

//   try {
//     const response = await axios.post(url, payload, { headers });
//     console.log("Task created successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error creating HubSpot task:",
//       error.response?.data || error
//     );
//     throw error;
//   }
// }

async function createHubSpotTask(taskData, ownerId, ownerName) {
  const url = "https://api.hubapi.com/crm/v3/objects/tasks";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
  };

  const statusMap = {
    open: "NOT_STARTED",
    pending: "DEFERRED",
    in_progress: "IN_PROGRESS",
    waiting: "WAITING",
    completed: "COMPLETED",
  };

  const normalizedStatus = String(taskData.status || "")
    .trim()
    .toLowerCase();
    

  const properties = {
  hs_task_subject: `${taskData.description ?? ""}`,
  hs_task_body: `Category: ${taskData.category?.name ?? ""}
Task Status: ${taskData?.status ?? ""}
Owner Name: ${taskData.owner?.name ?? ""}

interval: ${taskData.repeat?.interval ?? ""}
  frequency: ${taskData.repeat?.frequency ?? ""},
  on: ${taskData.repeat?.on ?? ""}
  Detail: ${taskData?.detail ?? ""}`,




    hs_task_status: statusMap[normalizedStatus],
    hs_timestamp: taskData.dueOn,
    hubspot_owner_id: ownerId,

  };

  // Clean undefined/null before sending
  const payload = {
    properties: cleanProps(properties),
  };

  console.log("Final Payload:", payload);

  try {
    const response = await axios.post(url, payload, { headers });
    console.log("Task created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating HubSpot task:",
      error.response?.data || error
    );
    throw error;
  }
}

// Search company by name in hubspot

async function searchCompanyByName(companyName) {
  try {
    if (!companyName) {
      console.log("Company name not provided");
      return {};
    }
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/companies/search",
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "name",
                operator: "EQ", // exact match
                value: companyName,
              },
            ],
          },
        ],
        properties: ["name", "domain", "phone", "address"],
        limit: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );

    return response.data.results[0] || {};
  } catch (error) {
    console.error(
      "Error searching company:",
      error.response?.data || error.message
    );
    return {};
  }
}

// Create comapny by Name in hubspot

async function createCompany(companyName) {
  try {
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/companies",
      {
        properties: {
          name: companyName, // Only required property
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );

    console.log("Company Created Successfully:");
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error.response?.data || error);
  }
}

// Associate deal to company

async function associateDealToCompany(dealId, companyId) {
  try {
    const url = `https://api.hubapi.com/crm/v3/associations/deal/company/batch/create`;

    const payload = {
      inputs: [
        {
          from: { id: dealId },
          to: { id: companyId },
          type: "deal_to_company",
        },
      ],
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Deal → Company Associated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error associating deal with company:",
      error?.response?.data || error
    );

    return {
      success: false,
      error: error?.response?.data || error,
    };
  }
}

// Associated contact to Task

async function associateContactToTask(contactId, taskId) {
  try {
    const baseUrl = process.env.HUBSPOT_BASE_URL || "https://api.hubapi.com";

    const url = `${baseUrl}/crm/v3/associations/contact/task/batch/create`;

    const payload = {
      inputs: [
        {
          from: { id: contactId },
          to: { id: taskId },
          type: "contact_to_task", // association type — usually contact_to_task or task_to_contact
        },
      ],
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Contact → Task associated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error associating contact with task:",
      error?.response?.data || error
    );
  }
}

// Associated Tasks to company

async function associateTaskToCompany(taskId, companyId) {
  try {
    const url = `https://api.hubapi.com/crm/v3/associations/task/company/batch/create`;

    const payload = {
      inputs: [
        {
          from: { id: taskId },
          to: { id: companyId },
          type: "task_to_company", // association type
        },
      ],
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Task → Company Associated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error associating task with company:",
      error?.response?.data || error
    );

    return {
      success: false,
      error: error?.response?.data || error,
    };
  }
}

// Update deal in hubspot

async function updateDeal(dealId, opportunity) {
  try {
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
        description: safeDescription,
        amount: opportunity.value?.amount || 0,
        closedate: safeCloseDate,
        capsule_stage: opportunity.milestone?.name || "",

        pipeline: "default",
        dealstage: stageMap[opportunity.milestone?.name] || null,
      }),
    };

    console.log(`Updating Deal ${dealId} with payload:`, payload);

    // -----------------------------
    // 3. HubSpot UPDATE API (PATCH)
    // -----------------------------
    const response = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        },
      }
    );

    console.log("Deal Updated Successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error Updating Deal:",
      error.response?.data || error.message
    );
    return {};
  }
}

// fetch owner by email
// async function getOwnerByEmail(email) {
//   if (!email) return null;

//   const url = "https://api.hubapi.com/owners/v2/owners";

//   try {
//     const response = await axios.get(url, {
//       headers: {
//         Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
//         Accept: "application/json",
//       },
//     });

//     // const owners = response.data;

//     // // Find owner by email (case-insensitive)
//     // const owner = owners.find(
//     //   (o) => o.email && o.email.toLowerCase() === email.toLowerCase()
//     // );

//     return response.data.results[0]|| {};
//   } catch (error) {
//     console.error(
//       "Error fetching owner:",
//       error.response?.data || error.message
//     );
//     return {};
//   }
// }

// new code

async function getOwnerByEmail(email) {
  if (!email) return null;

  // console.log("Token:", process.env.HUBSPOT_API_KEY); // must NOT be undefined

  try {
    const response = await axios.get("https://api.hubapi.com/crm/v3/owners", {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        Accept: "application/json",
      },
      params: {
        email, // v3 supports email filter
      },
    });

    // v3 response structure
    return response.data.results?.[0] || null;
  } catch (error) {
    console.error(
      "❌ Error fetching owner:",
      error.response?.data || error.message
    );
    return {};
  }
}

// Associate task with deal in hubspot
async function associateDealWithTask(taskId, dealId) {
  if (!taskId || !dealId) {
    throw new Error("taskId and dealId are required");
  }

  const url = `https://api.hubapi.com/crm/v3/objects/tasks/${taskId}/associations/deals/${dealId}/task_to_deal`;

  try {
    const response = await axios.put(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Task successfully associated with Deal");
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error associating task with deal:",
      error.response?.data || error.message
    );
    return {};
  }
}

//

async function createHubSpotNote(payload) {
  if (!payload) return {};
  try {
    const response = await axios.post(
      `https://api.hubapi.com/crm/v3/objects/notes`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating HubSpot Note:",
      error.response?.data || error.message
    );
    return {};
  }
}

// Update Notes in hubspot

async function updateHubSpotNote(noteId, payload) {
  if (!noteId || !payload) return {};

  try {
    const response = await axios.patch(
      `${HUBSPOT_BASE_URL}/crm/v3/objects/notes/${noteId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error updating HubSpot Note:",
      error.response?.data || error.message
    );
    return {};
  }
}

// Search company by Name






export {
  associateContactDeal,
  associateContactCompany,
  searchDealBySourceId,
  searchContactByEmail,
  createContactInHubSpot,
  createEmailEngagement,
  createHubSpotTask,
  searchCompanyByName,
  createCompany,
  associateDealToCompany,
  associateContactToTask,
  associateTaskToCompany,
  updateDeal,
  getOwnerByEmail,
  associateDealWithTask,
  createHubSpotNote,
  updateHubSpotNote,
  
};
