import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function proxy(req) {
        // Pastikan user memiliki izin (token ada)
        // withAuth secara otomatis memastikan hanya user login yang bisa akses rute ini
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Jika token ada, berarti user berhasil login dan emailnya ada di ADMIN_EMAIL
                return !!token;
            },
        },
        // pages: {
        //   signIn: '/login', // Opsional: redirect ke halaman login kustom jika belum login
        // },
    }
);

// Tentukan rute mana saja yang mau dilindungi
export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*"], // Sesuaikan dengan rute admin Anda
};
