// export const BASE_URL = "https://drawapp.bylokesh.in/v1";
// export const WS_URL = 'wss://drawapp.bylokesh.in/ws'

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL

console.log("base url", BASE_URL)
console.log("ws url", WS_URL)