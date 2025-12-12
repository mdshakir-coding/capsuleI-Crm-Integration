import axios from "axios";
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
    return null;
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

// Example usage of createEmailEngagement

// async function createEmailEngagement(contactId, emailData) {
//   try {
//     const payload = {
//       properties: {
//         hs_timestamp: Date.now(),
//         hs_email_subject: emailData.subject || "",
//         hs_email_text: emailData.body || "",
//         hs_email_direction: "INCOMING_EMAIL",  // FIXED
//       },
//       associations: [
//         {
//           to: { id: contactId },
//           types: [
//             {
//               associationCategory: "HUBSPOT_DEFINED",
//               associationTypeId: 9, // Correct association for Contact ↔ Email
//             },
//           ],
//         },
//       ],
//     };

//     const response = await axios.post(
//       "https://api.hubapi.com/crm/v3/objects/emails",
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
//         },
//       }
//     );

//     return response.data;

//   } catch (error) {
//     console.error(
//       "Error creating email engagement:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// }





async function createEmailEngagement(contactId, emailData) {
  try {

    const payload = {
      properties: cleanProps({
        hs_timestamp: Date.now(),
        hs_email_subject: emailData.subject || "",
        hs_email_text: emailData.body || "",
        hs_email_direction: emailData.direction,
      }),

      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 198,
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/emails",
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
      "Error creating email engagement:",
      error.response?.data || error.message
    );
    throw error;
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

// create hubspot to task used clear props()

async function createHubSpotTask(taskData) {
  const url = "https://api.hubapi.com/crm/v3/objects/tasks";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
  };

  // Build properties
  const properties = {
    hs_task_subject: taskData.category?.name,
    hs_task_body: taskData.description,
    hs_task_status: taskData.status === "OPEN" ? "NOT_STARTED" : "COMPLETED",
    hs_task_priority: "MEDIUM",
    hs_timestamp: taskData.dueOn
      ? `${taskData.dueOn}T09:00:00Z`
      : new Date().toISOString(),
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
  } catch (error) {3
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
          type: "contact_to_task",  // association type — usually contact_to_task or task_to_contact
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
  associateTaskToCompany
};
