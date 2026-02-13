console.log("=== BUILD ENVIRONMENT DEBUG ===");
console.log("FIREBASE_APP_HOSTING:", process.env.FIREBASE_APP_HOSTING);
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("FIREBASE_CONFIG present:", !!process.env.FIREBASE_CONFIG);
console.log("FIREBASE_WEBAPP_CONFIG present:", !!process.env.FIREBASE_WEBAPP_CONFIG);

if (process.env.FIREBASE_WEBAPP_CONFIG) {
    try {
        const config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
        console.log("FIREBASE_WEBAPP_CONFIG keys:", Object.keys(config));
        console.log("apiKey present:", !!config.apiKey);
        console.log("authDomain:", config.authDomain);
        console.log("projectId:", config.projectId);
    } catch (e) {
        console.error("Error parsing FIREBASE_WEBAPP_CONFIG:", e);
    }
}

console.log("NEXT_PUBLIC_FIREBASE_API_KEY present:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log("===============================");
