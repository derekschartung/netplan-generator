# Netplan Generator

A visual builder for Ubuntu [Netplan](https://netplan.io/) YAML configurations. No backend — runs entirely in the browser.

**Live site:** https://derekschartung.github.io/netplan-generator/

## Supported interface types

- Ethernet
- Wi-Fi (single SSID + WPA password)
- Bridge
- Bond (with mode and MII interval)
- VLAN

## Supported options

- DHCPv4 / DHCPv6
- Static IPv4 and IPv6 addressing (CIDR)
- Default gateway
- Nameservers and DNS search domains
- Inline validation for IPs, CIDRs, VLAN IDs

## Development

```bash
npm install
npm run dev      # http://localhost:5173/netplan-generator/
npm run build
npm run preview
```

## Deployment

GitHub Actions builds and deploys to GitHub Pages on every push to `main`.  
Enable in repo **Settings → Pages → Source: GitHub Actions**.

---

## Roadmap (v2)

### High priority
- [ ] `mtu` — per-interface MTU
- [ ] `match` block — match by MAC address, interface name glob, or driver
- [ ] `set-name` — rename interface via udev
- [ ] `macaddress` override
- [ ] Multiple routes (currently only default gateway)
- [ ] Bridge parameters — STP, ageing-time, hello-time, forward-delay, priority, path-cost
- [ ] Additional bond parameters — up-delay, down-delay, arp-interval, primary, transmit-hash-policy

### Medium priority
- [ ] Wi-Fi: multiple access points per interface
- [ ] Wi-Fi: `mode` (infrastructure / ap / adhoc), `band`, `channel`, `hidden`, `bssid`
- [ ] 802.1x authentication (enterprise Wi-Fi and wired auth)
- [ ] `routing-policy` — source-based routing rules
- [ ] IPv6 options — `accept-ra`, `ipv6-privacy`, `link-local`
- [ ] `optional` — don't block boot if interface is absent
- [ ] `wakeonlan`
- [ ] Per-device `renderer` (networkd vs NetworkManager)

### Lower priority
- [ ] Tunnels — GRE, IPIP, SIT, VTI, WireGuard
- [ ] Modems
- [ ] Infiniband
- [ ] SR-IOV / virtual functions
- [ ] `nm-devices`
