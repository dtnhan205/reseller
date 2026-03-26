const axios = require("axios");
const { HttpError } = require("../utils/httpError");

function getProxyVipKeyServerConfig() {
  const baseUrl = String(process.env.PROXYVIP_KEY_SERVER_URL || "").trim();
  const serviceKey = String(process.env.PROXYVIP_KEY_SERVER_SERVICE_KEY || "").trim();
  if (!baseUrl) {
    throw new HttpError(500, "Missing PROXYVIP_KEY_SERVER_URL");
  }
  if (!serviceKey) {
    throw new HttpError(500, "Missing PROXYVIP_KEY_SERVER_SERVICE_KEY");
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), serviceKey };
}

async function createProxyVipLicenseKey(duration, source = "v1") {
  const { baseUrl, serviceKey } = getProxyVipKeyServerConfig();
  try {
    const res = await axios.post(
      `${baseUrl}/api/service/keys/create`,
      { duration, source },
      {
        timeout: 12_000,
        headers: {
          "Content-Type": "application/json",
          "X-Service-Key": serviceKey,
        },
      }
    );

    const key = res?.data?.key || res?.data?.licenseKey || res?.data?.value;
    if (!key || typeof key !== "string") {
      throw new HttpError(502, "Key server returned invalid response");
    }
    return key;
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Key server error";
    throw new HttpError(status && Number.isFinite(status) ? status : 502, `Create key failed: ${msg}`);
  }
}

function deriveDurationFromProductName(name) {
  const s = String(name || "").toLowerCase();
  // Heuristics: supports Vietnamese + shorthand (must match admin_server valid durations).
  if (s.includes("2h") || s.includes("2 giờ") || s.includes("2 gio")) return "2h";
  if (s.includes("1h") || s.includes("1 giờ") || s.includes("1 gio")) return "1h";
  if (s.includes("1w") || s.includes("week") || s.includes("tuần")) return "1w";
  if (s.includes("1d") || s.includes("day") || s.includes("ngày")) return "1d";
  if (s.includes("1y") || s.includes("year") || s.includes("năm")) return "1y";
  if (s.includes("1m") || s.includes("month") || s.includes("tháng")) return "1m";
  return "1m";
}

function deriveSourceFromProductName(name) {
  const s = String(name || "").toLowerCase();
  if (s.includes("v3") || s.includes("no-antena-v3") || s.includes("no antenna v3") || s.includes("nov3") || s.includes("nov3")) {
    return "v3";
  }
  if (s.includes("v2") || s.includes("no antena") || s.includes("no-antena") || s.includes("noantenna") || s.includes("nov2") || s.includes("no v2")) {
    return "v2";
  }
  return "v1";
}

module.exports = {
  createProxyVipLicenseKey,
  deriveDurationFromProductName,
  deriveSourceFromProductName,
};

