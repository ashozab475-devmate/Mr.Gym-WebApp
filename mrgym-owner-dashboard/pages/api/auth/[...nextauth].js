import dns from "dns";
import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth";

// --- Workaround for Windows / Node DNS & Google OAuth connectivity ---
//
// On certain Windows environments, Node's default OS lookup can fail with
// `getaddrinfo ENOTFOUND *.googleapis.com`. At the same time, forcing c-ares
// with IPv6 results causes `AggregateError [ETIMEDOUT]` if the local network
// does not have routable IPv6 connectivity.
//
// This patch:
// 1. Tries the OS lookup first (fast, preserves local network config).
// 2. If OS lookup fails (e.g. ENOTFOUND), falls back to c-ares resolving
//    IPv4 addresses using reliable public DNS (8.8.8.8, 1.1.1.1).
// 3. Avoids unroutable IPv6 addresses that cause connection timeouts.

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const originalLookup = dns.lookup.bind(dns);

function patchedLookup(hostname, options, callback) {
  let cb = callback;
  let opts = {};
  if (typeof options === "function") {
    cb = options;
  } else if (typeof options === "number") {
    opts = { family: options };
  } else if (options && typeof options === "object") {
    opts = options;
  }

  originalLookup(hostname, options, (err, ...args) => {
    if (!err) {
      return cb(null, ...args);
    }

    // Fall back to c-ares IPv4 resolver using Google & Cloudflare DNS
    const wantAll = opts.all === true;
    dns.resolve4(hostname, (resErr, addrs) => {
      if (resErr || !addrs || addrs.length === 0) {
        return cb(err, ...args);
      }
      if (wantAll) {
        return cb(
          null,
          addrs.map((address) => ({ address, family: 4 }))
        );
      }
      return cb(null, addrs[0], 4);
    });
  });
}

try {
  dns.lookup = patchedLookup;
} catch {
  // If patching fails, continue with original lookup
}

export default NextAuth(authOptions);
