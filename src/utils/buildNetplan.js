import yaml from 'js-yaml'

function parseAddresses(str) {
  return str.split(',').map(s => s.trim()).filter(Boolean)
}

function buildAddressing(iface) {
  const cfg = {}

  if (iface.dhcp) cfg.dhcp4 = true
  if (iface.dhcp6) cfg.dhcp6 = true

  if (!iface.dhcp || !iface.dhcp6) {
    const addrs = [iface.address, iface.address6].filter(Boolean)
    if (addrs.length) cfg.addresses = addrs
  }

  if (!iface.dhcp) {
    if (iface.gateway) cfg.routes = [{ to: 'default', via: iface.gateway }]
    const nsAddrs = iface.nameservers ? parseAddresses(iface.nameservers) : []
    const nsSearch = iface.dnsSearch ? parseAddresses(iface.dnsSearch) : []
    if (nsAddrs.length || nsSearch.length) {
      cfg.nameservers = {}
      if (nsAddrs.length) cfg.nameservers.addresses = nsAddrs
      if (nsSearch.length) cfg.nameservers.search = nsSearch
    }
  }

  return cfg
}

export function buildNetplan(ifaces) {
  const ethernets = {}
  const wifis = {}
  const bridges = {}
  const bonds = {}
  const vlans = {}

  ifaces.forEach(iface => {
    const cfg = buildAddressing(iface)

    if (iface.type === 'ethernet') {
      ethernets[iface.name] = cfg
    } else if (iface.type === 'wifi') {
      cfg['access-points'] = {
        [iface.ssid || 'MyNetwork']: iface.wpaPassword ? { password: iface.wpaPassword } : {}
      }
      wifis[iface.name] = cfg
    } else if (iface.type === 'bridge') {
      if (iface.bridgeMembers) cfg.interfaces = parseAddresses(iface.bridgeMembers)
      bridges[iface.name] = cfg
    } else if (iface.type === 'bond') {
      if (iface.bondMembers) cfg.interfaces = parseAddresses(iface.bondMembers)
      cfg.parameters = { mode: iface.bondMode || 'active-backup' }
      if (iface.bondMiiInterval) cfg.parameters['mii-monitor-interval'] = Number(iface.bondMiiInterval)
      bonds[iface.name] = cfg
    } else if (iface.type === 'vlan') {
      if (iface.vlanId) cfg.id = Number(iface.vlanId)
      if (iface.vlanLink) cfg.link = iface.vlanLink
      vlans[iface.name] = cfg
    }
  })

  const doc = { network: { version: 2, renderer: 'networkd' } }
  if (Object.keys(ethernets).length) doc.network.ethernets = ethernets
  if (Object.keys(wifis).length) doc.network.wifis = wifis
  if (Object.keys(bridges).length) doc.network.bridges = bridges
  if (Object.keys(bonds).length) doc.network.bonds = bonds
  if (Object.keys(vlans).length) doc.network.vlans = vlans

  return yaml.dump(doc, { lineWidth: -1 })
}
