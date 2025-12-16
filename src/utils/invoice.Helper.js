import axios from "axios";
import csv from "csv-parser";
import { Readable } from "stream";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/17EIBkq4kRWT9P_SKpc_8g36KOIlmn8F6WoXB9MjJLPA/export?format=csv";

async function fetchCsvData() {
  const response = await axios.get(CSV_URL, {
    responseType: "text",
  });

  return new Promise((resolve, reject) => {
    const results = [];

    Readable.from(response.data)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

export { fetchCsvData };
