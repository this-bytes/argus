// InfoSec Lookup URLs for IP, Domain, CVE, Hash lookups

export const IP_LOOKUPS = {
  shodan: (ip) => `https://www.shodan.io/host/${ip}`,
  virustotal: (ip) => `https://www.virustotal.com/gui/ip-address/${ip}`,
  abuseipdb: (ip) => `https://www.abuseipdb.com/check/${ip}`,
  greynoise: (ip) => `https://viz.greynoise.io/ip/${ip}`,
};

export const DOMAIN_LOOKUPS = {
  securitytrails: (domain) => `https://securitytrails.com/domain/${domain}`,
  crtsh: (domain) => `https://crt.sh/?q=${domain}`,
  virustotal: (domain) => `https://www.virustotal.com/gui/domain/${domain}`,
  dnsdumpster: (domain) => `https://dnsdumpster.com/?q=${domain}`,
};

export const CVE_LOOKUPS = {
  nvd: (cve) => `https://nvd.nist.gov/vuln/detail/${cve.toUpperCase()}`,
  mitre: (cve) => `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve.toUpperCase()}`,
  exploitdb: (cve) => `https://www.exploit-db.com/search?cve=${cve.toUpperCase()}`,
};

export const HASH_LOOKUPS = {
  virustotal: (hash) => `https://www.virustotal.com/gui/search/${hash}`,
  hybridanalysis: (hash) => `https://www.hybrid-analysis.com/search?query=${hash}`,
};

// Bang syntax search engines (DuckDuckGo style)
export const BANG_ENGINES = {
  // General search
  '!g': { url: 'https://www.google.com/search?q=', name: 'Google' },
  '!ddg': { url: 'https://duckduckgo.com/?q=', name: 'DuckDuckGo' },
  '!b': { url: 'https://www.bing.com/search?q=', name: 'Bing' },
  
  // Development
  '!gh': { url: 'https://github.com/search?q=', name: 'GitHub' },
  '!so': { url: 'https://stackoverflow.com/search?q=', name: 'StackOverflow' },
  '!mdn': { url: 'https://developer.mozilla.org/search?q=', name: 'MDN' },
  '!npm': { url: 'https://www.npmjs.com/search?q=', name: 'NPM' },
  
  // Security
  '!cve': { url: 'https://nvd.nist.gov/vuln/search/results?query=', name: 'NVD CVE' },
  '!vt': { url: 'https://www.virustotal.com/gui/search/', name: 'VirusTotal' },
  '!shodan': { url: 'https://www.shodan.io/search?query=', name: 'Shodan' },
  '!exp': { url: 'https://www.exploit-db.com/search?q=', name: 'Exploit-DB' },
  
  // Social/Other
  '!yt': { url: 'https://www.youtube.com/results?search_query=', name: 'YouTube' },
  '!r': { url: 'https://www.reddit.com/search?q=', name: 'Reddit' },
  '!w': { url: 'https://en.wikipedia.org/wiki/Special:Search?search=', name: 'Wikipedia' },
  '!twitter': { url: 'https://twitter.com/search?q=', name: 'Twitter' },
  '!x': { url: 'https://twitter.com/search?q=', name: 'X/Twitter' },
};

// Check if a string looks like a URL
export function isUrl(str) {
  // Check for common URL patterns
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return true;
  }
  // Check for domain-like patterns (e.g., example.com, github.io)
  const domainPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z]{2,})+$/;
  if (domainPattern.test(str.split('/')[0])) {
    return true;
  }
  return false;
}

// Parse bang syntax from input
export function parseBang(input) {
  const trimmed = input.trim();
  
  // Check for bang at the start
  for (const [bang, engine] of Object.entries(BANG_ENGINES)) {
    if (trimmed.startsWith(bang + ' ')) {
      const query = trimmed.slice(bang.length + 1).trim();
      return { bang, engine, query };
    }
  }
  
  return null;
}

// Get lookup URLs for different types
export function getIpLookupUrls(ip) {
  return Object.entries(IP_LOOKUPS).map(([name, fn]) => ({
    name,
    url: fn(ip),
  }));
}

export function getDomainLookupUrls(domain) {
  return Object.entries(DOMAIN_LOOKUPS).map(([name, fn]) => ({
    name,
    url: fn(domain),
  }));
}

export function getCveLookupUrls(cve) {
  return Object.entries(CVE_LOOKUPS).map(([name, fn]) => ({
    name,
    url: fn(cve),
  }));
}

export function getHashLookupUrls(hash) {
  return Object.entries(HASH_LOOKUPS).map(([name, fn]) => ({
    name,
    url: fn(hash),
  }));
}
