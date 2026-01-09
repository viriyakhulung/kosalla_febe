(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__3cd9a42d._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/kosalla-monorepo/apps/client/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/kosalla-monorepo/node_modules/.pnpm/next@16.0.10_@babel+core@7._c57d9b56c0bd86dac4690a5de51b3a27/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/kosalla-monorepo/node_modules/.pnpm/next@16.0.10_@babel+core@7._c57d9b56c0bd86dac4690a5de51b3a27/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/unauthorized"
];
// ⚠️ SESUAI master_roles kamu: superadmin | viriyastaff | custstaff
const roleRoutes = {
    "/admin": [
        "superadmin"
    ],
    "/engineers": [
        "superadmin",
        "viriyastaff"
    ],
    "/engineer": [
        "superadmin",
        "viriyastaff"
    ],
    "/portal": [
        "custstaff",
        "viriyastaff",
        "superadmin"
    ],
    "/profile": [
        "custstaff",
        "viriyastaff",
        "superadmin"
    ]
};
async function fetchMeWithToken(token) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${apiUrl}/api/auth/me`;
    return fetch(url, {
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`
        },
        cache: "no-store"
    });
}
async function middleware(req) {
    const { pathname } = req.nextUrl;
    // skip assets
    if (pathname.startsWith("/_next/") || pathname.startsWith("/api/") || pathname.includes(".")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // public route
    if (publicRoutes.includes(pathname)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // token cookie wajib untuk route private
    const token = req.cookies.get("kosalla_token")?.value;
    // 👇👇👇 [DEBUG LOG 1] Cek Token Cookie 👇👇👇
    console.log(`🍪 [MW] Accessing: ${pathname} | Token exists?`, Boolean(token));
    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("next", pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
    }
    // validasi token
    const meRes = await fetchMeWithToken(token);
    // 👇👇👇 [DEBUG LOG 2] Cek Respon Backend 👇👇👇
    console.log("🤷‍♂️ [MW] fetch /me status:", meRes.status);
    if (!meRes.ok) {
        const res = __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/login", req.url));
        res.cookies.delete("kosalla_token");
        return res;
    }
    // parse /me response
    const json = await meRes.json().catch(()=>null);
    // ✅ ambil role dari master_role (string), bukan dari spatie
    const masterRole = json?.user?.master_role ?? null;
    // kalau suatu saat spatie dipakai lagi, ini tetap aman
    const roles = json?.user?.roles ?? [];
    const userRoles = Array.from(new Set([
        ...Array.isArray(roles) ? roles : [],
        ...masterRole ? [
            masterRole
        ] : []
    ]));
    // role check untuk route yang match
    const matchedRoute = Object.keys(roleRoutes).find((r)=>pathname.startsWith(r));
    if (matchedRoute) {
        const allowedRoles = roleRoutes[matchedRoute];
        const ok = userRoles.some((r)=>allowedRoles.includes(r));
        if (!ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/unauthorized", req.url));
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$kosalla$2d$monorepo$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_$40$babel$2b$core$40$7$2e$_c57d9b56c0bd86dac4690a5de51b3a27$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__3cd9a42d._.js.map