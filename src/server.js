import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { syncToHubspotasync } from "./controller/sync.controller.js";
import{fetchCapsuleEmailEntries} from "./service/service.js";
import { syncTasks } from "./controller/task.controller.js";
import {syncOpportunities} from "./controller/opportunity.controller.js";
import { syncEmails } from "./controller/email.controller.js";
import {syncActivity} from "./controller/activity.controller.js";
import { syncNotes } from "./controller/notes.controller.js";


console.log("Loaded API Token:", process.env.HUBSPOT_API_KEY);
console.log("Loaded Capsule API Token:", process.env.CAPSULE_API_TOKEN);

const PORT = process.env.PORT || 3000;
// syncToHubspotasync(); 
// syncTasks();
// syncOpportunities();
// syncEmails();
// syncActivity();
syncNotes();


app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
