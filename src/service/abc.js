import axios from "axios";



// Associate Contact with Deal

// async function associateContactCompany(contactId, companyId) {
//   try {
//     const url = `https://api.capsulecrm.com/api/v2/parties/${personId}/organisation`;

//     const payload = {
//       organisationId: companyId,
//     };

//     const response = await axios.put(
//       url,
//       payload,
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
//       message: "Contact successfully associated with company",
//       data: response.data,
//     };
//   } catch (error) {
//     console.error("❌ Error associating Contact with Company:", error?.response?.data || error);
//     return {
//       success: false,
//       error: error?.response?.data || error,
//     };
//   }
// }

async function associateContactCompany(contactId, companyId) {
  try {
    const url = `https://api.capsulecrm.com/api/v3/parties/${contactId}/opportunities`;

    const payload = {
      organisationId: companyId,
    };

    const response = await axios.patch(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      message: "Contact successfully associated with company (API v3)",
      data: response.data,
    };
  } catch (error) {
    console.error("❌ Error associating contact with company (API v3):", error?.response?.data || error);

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

async function associateContactDeal(contactId, dealId) {
  try {
    const url = `https://api.capsulecrm.com/api/v2/parties/${contactId}/opportunities/${dealId}`;

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    return {
      success: true,
      
      message: "Contact successfully associated with deal",
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data || error,
    };
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
              value: sourceId
            }
          ]
        }
      ],
      properties: ["dealname", "sourceid", "amount", "pipeline", "dealstage", "description"],
      limit: 10,
      after: 0
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${process.env.HUBSPOT_API_KEY}`,
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error searching deal by sourceid:", error.response?.data || error.message);
    return null;
  }
}

// Example usage:
// searchDealBySourceId("5948655").then(result => console.log(result));



// Search Contact by Email

async function searchContactByEmail(email) {
  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email
              }
            ]
          }
        ],
        properties: ["firstname", "lastname", "email", "phone"],
        limit: 1
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        }
      }
    );

    return response.results[0];
  } catch (error) {
    console.error("Error searching contact:", error.response?.data || error);
    return null;
  }
}









export  { associateContactDeal,associateContactCompany,searchDealBySourceId,searchContactByEmail};