const axios = require("axios");
const fs = require("fs");

const banner = `
╔═════════════════════════════════════════════╗
║                                             ║
║   🚀 Flow3 Network Bot by NT - Exhaust 🚀   ║
║                                             ║
╚═════════════════════════════════════════════╝
`;

const API_URL = "https://api.flow3.tech/api/v1";
const TOKEN_PATH = "token.txt";

const getAuthToken = () => {
    try {
        return `Bearer ${fs.readFileSync(TOKEN_PATH, "utf8").trim()}`;
    } catch (error) {
        console.error("Error reading token:", error.message);
        process.exit(1);
    }
};

const HEADERS = () => ({
    Authorization: getAuthToken(),
    Accept: "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
});

// Fungsi untuk format waktu yang lebih rapi
const formatTime = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "medium",
        timeZone: "Asia/Jakarta",
    }).format(date);
};

const requestBandwidth = async () => {
    try {
        const response = await axios.post(`${API_URL}/bandwidth`, {}, { headers: HEADERS() });
        const data = response.data.data;

        return {
            message: response.data.message,
            walletAddress: data.walletAddress,
            startTime: formatTime(data.startTime),
            endTime: formatTime(data.endTime),
            totalTime: data.totalTime,
            referralCode: data.wallet.referralCode,
        };
    } catch (error) {
        console.error("Error Requesting Bandwidth:", error.response ? error.response.data : error.message);
        return null;
    }
};

const checkPoints = async () => {
    try {
        const response = await axios.get(`${API_URL}/point/info`, { headers: HEADERS() });
        const data = response.data.data;

        return {
            message: response.data.message,
            totalEarning: data.totalEarningPoint,
            todayEarning: data.todayEarningPoint,
            referralEarning: data.referralEarningPoint,
        };
    } catch (error) {
        console.error("Error Checking Points:", error.response ? error.response.data : error.message);
        return null;
    }
};

const runLoop = async () => {
    console.log(banner);
    while (true) {
        const bandwidth = await requestBandwidth();
        const points = await checkPoints();

        if (bandwidth && points) {
            console.log(`
\x1b[34m============= Flow3 Network Bot =============\x1b[0m
\x1b[33m[ Bandwidth Requested ]\x1b[0m
Message       : ${bandwidth.message}
Wallet Address: ${bandwidth.walletAddress}
Start Time    : ${bandwidth.startTime}
End Time      : ${bandwidth.endTime}
Total Time    : ${bandwidth.totalTime} seconds
Referral Code : ${bandwidth.referralCode}

\x1b[32m[ Current Points ]\x1b[0m
Message              : ${points.message}
Total Earning Points : ${points.totalEarning}
Today Earning Points : ${points.todayEarning}
Referral Earnings    : ${points.referralEarning}
\x1b[34m===============================================\x1b[0m
`);
        }

        console.log("Menunggu 10 detik sebelum request berikutnya...\n");
        await new Promise((resolve) => setTimeout(resolve, 10000));
    }
};

// Jalankan loop
runLoop();
