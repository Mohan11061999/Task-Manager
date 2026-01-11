// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { signJwt } from "@/src/lib/auth";
// import { sql } from "@/src/lib/db";

// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password required" },
//         { status: 400 }
//       );
//     }

//     const users = await sql`
//       SELECT * FROM users WHERE email = ${email}
//     `;

//     const user = users[0];
//     if (!user) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) {
//       return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//     }

//     const token = signJwt({ userId: user.id, email: user.email });

//     const response = NextResponse.json({ success: true });

//     response.cookies.set("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//     });

//     return response;
//   } catch {
//     return NextResponse.json(
//       { error: "Login failed" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signJwt } from "@/src/lib/auth";
import { supabase } from "@/src/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', email);

    if (error) {
      throw new Error("Database error");
    }

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
