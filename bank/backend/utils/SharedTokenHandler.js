import jwt from "jsonwebtoken";

const GenerateToken = (data) => {
  const iat = Math.floor(Date.now() / 1000); // issued at
  const exp = iat + Number(process.env.TIME_TOLERANCE || 60); // expires in TIME_TOLERANCE seconds

  const token = jwt.sign(
    {
      data: data,
      iat,
      exp,
    },
    process.env.SHARED_SECRET,
    {
      algorithm: "HS256",
      issuer: process.env.BANK_ID,
      audience: process.env.GATEWAY_ID,
    }
  );

  return token;
};

export { GenerateToken };
