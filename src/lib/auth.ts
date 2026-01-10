// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET!;

// export type JwtPayload = {
//   userId: number;
//   email: string;
// };

// export function signJwt(payload: JwtPayload) {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
// }

// export function verifyJwt(token: string): JwtPayload | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as JwtPayload;
//   } catch {
//     return null;
//   }
// }


import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export type JwtPayload = {
  userId: number;
  email: string;
};

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
