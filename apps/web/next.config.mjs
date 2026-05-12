import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  outputFileTracingRoot: fileURLToPath(new URL("../../", import.meta.url)),
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  transpilePackages: ["@rachao/types", "@rachao/utils"],
};

export default nextConfig;
