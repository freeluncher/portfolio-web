require('dotenv').config({ path: '.env.local' });

async function debugWaka() {
  const apiKey = process.env.WAKATIME_API_KEY;
  if (!apiKey) {
    console.log("No API Key found");
    return;
  }
  
  const encodedKey = Buffer.from(apiKey).toString('base64');
  // Try the endpoint currently used
  const url = "https://wakatime.com/api/v1/users/current/stats/last_7_days";
  
  console.log("Fetching:", url);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${encodedKey}` }
    });
    
    if (!res.ok) {
        console.log("Error:", res.status, res.statusText);
        const text = await res.text();
        console.log("Body:", text);
        return;
    }
    
    const data = await res.json();
    console.log("Full Data Keys:", Object.keys(data.data || {}));
    console.log("Total Seconds Today (from stats):", data.data.total_seconds_today);
    // Also try to check the languages
    const languages = data.data.languages ? data.data.languages.slice(0, 3) : [];
    console.log("Languages:", languages);
    
    // Also try the summaries endpoint which is more granular for 'today'
    const summaryUrl = "https://wakatime.com/api/v1/users/current/summaries?start=today&end=today";
    console.log("\nFetching Summary:", summaryUrl);
    const summaryRes = await fetch(summaryUrl, {
      headers: { Authorization: `Basic ${encodedKey}` }
    });
    
    if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        console.log("Summary Data:", JSON.stringify(summaryData.data, null, 2));
    } else {
        console.log("Summary Error:", summaryRes.status);
    }
    
  } catch (e) {
    console.error(e);
  }
}

debugWaka();
