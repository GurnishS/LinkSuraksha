import { SignJWT } from 'jose';

// Generate JWT token for gateway authentication
const GenerateToken = async () => {
  try {
    const api = import.meta.env.VITE_API_KEY;
    const secret = import.meta.env.VITE_API_SECRET;
    const receiverServiceAccountId = import.meta.env.VITE_RECEIVER_SERVICE_ACCOUNT_ID;

    if (!api || !secret || !receiverServiceAccountId) {
      throw new Error("Missing required environment variables: VITE_API_KEY, VITE_API_SECRET, or VITE_RECEIVER_ID");
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + Number(import.meta.env.VITE_TIME_TOLERANCE || 600);

    // Create JWT token using jose library (browser-compatible)
    const secretKey = new TextEncoder().encode(secret);
    
    const jwt = await new SignJWT({ merchant: { api, receiverServiceAccountId }, iat, exp })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .sign(secretKey);

    return jwt;
  } catch (err) {
    console.error("JWT generation failed:", err);
    throw new Error("Failed to generate authentication token");
  }
};

export const initiateTransaction = async (amount, setStatusCallback) => {
  const gatewayUri = import.meta.env.VITE_GATEWAY_URI;
  
  if (!gatewayUri) {
    throw new Error("Missing required environment variable: VITE_GATEWAY_URI");
  }

  const token = await GenerateToken();

  try {
    const response = await fetch(`${gatewayUri}/initiate-transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        receiverServiceAccountId: import.meta.env.VITE_RECEIVER_SERVICE_ACCOUNT_ID,
        apiKey: import.meta.env.VITE_API_KEY,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to initiate transaction");
    }

    const { transactionId, paymentUrl } = await response.json();
    

    const sseUrl = `${gatewayUri}/sse?token=${token}&receiverServiceAccountId=${import.meta.env.VITE_RECEIVER_SERVICE_ACCOUNT_ID}&transactionId=${transactionId}&apiKey=${import.meta.env.VITE_API_KEY}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("SSE Message:", data);

      if (data.message.type === "INITIATED") {
        setStatusCallback("Transaction initiated...");
      } else if (data.message.type === "COMPLETED") {
        setStatusCallback("✅ Payment completed");
        eventSource.close();
      } else if (data.message.type === "FAILED") {
        setStatusCallback("❌ Payment failed");
        eventSource.close();
      }
    };

    eventSource.onerror = (err) => {
      console.error("❌ SSE connection error:", err);
      setStatusCallback("❌ SSE error. Please retry.");
      eventSource.close();
    };

    // Return transaction details for QR code generation
    return {
      transactionId,
      paymentUrl,
      eventSource
    };

  } catch (error) {
    console.error("Transaction initiation failed:", error);
    throw error;
  }
};
