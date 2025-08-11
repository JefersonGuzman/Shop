// Prints current outbound (egress) public IP. Useful for temporary whitelisting.
// Note: On Render Free, this IP may change on each deploy/scale event.

const providers = [
  'https://api.ipify.org',
  'https://ifconfig.me/ip',
  'https://ident.me',
];

(async () => {
  for (const url of providers) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) continue;
      const ip = (await res.text()).trim();
      if (ip) {
        console.log(`Current outbound IP: ${ip}`);
        return;
      }
    } catch {}
  }
  console.log('Current outbound IP: unknown');
})();


