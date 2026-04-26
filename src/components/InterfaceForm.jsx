import { isValidCidr, isValidIp, isValidCidr6 } from '../utils/validateIp'

export const defaultIface = {
  type: 'ethernet', name: 'eth0',
  dhcp: false, dhcp6: false,
  address: '', address6: '', gateway: '', nameservers: '', dnsSearch: '',
  ssid: '', wpaPassword: '',
  bridgeMembers: '',
  bondMembers: '', bondMode: 'active-backup', bondMiiInterval: 100,
  vlanId: '', vlanLink: '',
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    >
      {children}
    </select>
  )
}

function getErrors(iface) {
  const errs = {}
  if (!iface.name.trim()) errs.name = 'Required'
  if (!iface.dhcp) {
    if (iface.address && !isValidCidr(iface.address)) errs.address = 'Must be CIDR (e.g. 192.168.1.10/24)'
    if (iface.gateway && !isValidIp(iface.gateway)) errs.gateway = 'Invalid IP'
    if (iface.nameservers) {
      const invalid = iface.nameservers.split(',').map(s => s.trim()).filter(s => s && !isValidIp(s))
      if (invalid.length) errs.nameservers = `Invalid: ${invalid.join(', ')}`
    }
  }
  if (iface.address6 && !isValidCidr6(iface.address6)) errs.address6 = 'Must be IPv6 CIDR (e.g. 2001:db8::1/64)'
  if (iface.type === 'vlan') {
    if (!iface.vlanLink.trim()) errs.vlanLink = 'Required'
    const id = Number(iface.vlanId)
    if (iface.vlanId && (isNaN(id) || id < 1 || id > 4094)) errs.vlanId = 'Must be 1–4094'
  }
  return errs
}

export function InterfaceForm({ ifaces, onChange }) {
  function update(idx, field, value) {
    const next = ifaces.map((iface, i) => i === idx ? { ...iface, [field]: value } : iface)
    onChange(next)
  }

  function add() {
    onChange([...ifaces, { ...defaultIface, name: `eth${ifaces.length}` }])
  }

  function remove(idx) {
    onChange(ifaces.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-4">
      {ifaces.map((iface, idx) => {
        const errs = getErrors(iface)
        const showStatic = !iface.dhcp || !iface.dhcp6
        return (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">Interface {idx + 1}</span>
              {ifaces.length > 1 && (
                <button onClick={() => remove(idx)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Select value={iface.type} onChange={e => update(idx, 'type', e.target.value)}>
                  <option value="ethernet">Ethernet</option>
                  <option value="wifi">Wi-Fi</option>
                  <option value="bridge">Bridge</option>
                  <option value="bond">Bond</option>
                  <option value="vlan">VLAN</option>
                </Select>
              </Field>

              <Field label="Interface Name" error={errs.name}>
                <Input value={iface.name} onChange={e => update(idx, 'name', e.target.value)} placeholder="eth0" />
              </Field>
            </div>

            {/* DHCP toggles */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={iface.dhcp} onChange={e => update(idx, 'dhcp', e.target.checked)} className="rounded" />
                DHCPv4
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={iface.dhcp6} onChange={e => update(idx, 'dhcp6', e.target.checked)} className="rounded" />
                DHCPv6
              </label>
            </div>

            {/* Static addressing */}
            {showStatic && (
              <div className="flex flex-col gap-3">
                {!iface.dhcp && (
                  <Field label="IPv4 Address (CIDR)" error={errs.address}>
                    <Input value={iface.address} onChange={e => update(idx, 'address', e.target.value)} placeholder="192.168.1.10/24" />
                  </Field>
                )}
                {!iface.dhcp6 && (
                  <Field label="IPv6 Address (CIDR)" error={errs.address6}>
                    <Input value={iface.address6} onChange={e => update(idx, 'address6', e.target.value)} placeholder="2001:db8::1/64" />
                  </Field>
                )}
                {!iface.dhcp && (
                  <>
                    <Field label="Gateway" error={errs.gateway}>
                      <Input value={iface.gateway} onChange={e => update(idx, 'gateway', e.target.value)} placeholder="192.168.1.1" />
                    </Field>
                    <Field label="Nameservers (comma-separated)" error={errs.nameservers}>
                      <Input value={iface.nameservers} onChange={e => update(idx, 'nameservers', e.target.value)} placeholder="8.8.8.8, 8.8.4.4" />
                    </Field>
                    <Field label="DNS Search Domains (comma-separated)">
                      <Input value={iface.dnsSearch} onChange={e => update(idx, 'dnsSearch', e.target.value)} placeholder="example.com, local" />
                    </Field>
                  </>
                )}
              </div>
            )}

            {/* Wi-Fi specific */}
            {iface.type === 'wifi' && (
              <div className="flex flex-col gap-3">
                <Field label="SSID">
                  <Input value={iface.ssid} onChange={e => update(idx, 'ssid', e.target.value)} placeholder="MyNetwork" />
                </Field>
                <Field label="WPA Password">
                  <Input type="password" value={iface.wpaPassword} onChange={e => update(idx, 'wpaPassword', e.target.value)} placeholder="password" />
                </Field>
              </div>
            )}

            {/* Bridge specific */}
            {iface.type === 'bridge' && (
              <Field label="Bridge Members (comma-separated)">
                <Input value={iface.bridgeMembers} onChange={e => update(idx, 'bridgeMembers', e.target.value)} placeholder="eth0, eth1" />
              </Field>
            )}

            {/* Bond specific */}
            {iface.type === 'bond' && (
              <div className="flex flex-col gap-3">
                <Field label="Bond Members (comma-separated)">
                  <Input value={iface.bondMembers} onChange={e => update(idx, 'bondMembers', e.target.value)} placeholder="eth0, eth1" />
                </Field>
                <Field label="Bond Mode">
                  <Select value={iface.bondMode} onChange={e => update(idx, 'bondMode', e.target.value)}>
                    <option value="active-backup">active-backup</option>
                    <option value="802.3ad">802.3ad (LACP)</option>
                    <option value="balance-rr">balance-rr</option>
                    <option value="balance-xor">balance-xor</option>
                    <option value="broadcast">broadcast</option>
                    <option value="balance-tlb">balance-tlb</option>
                    <option value="balance-alb">balance-alb</option>
                  </Select>
                </Field>
                <Field label="MII Monitor Interval (ms)">
                  <Input type="number" min="0" value={iface.bondMiiInterval} onChange={e => update(idx, 'bondMiiInterval', e.target.value)} placeholder="100" />
                </Field>
              </div>
            )}

            {/* VLAN specific */}
            {iface.type === 'vlan' && (
              <div className="flex flex-col gap-3">
                <Field label="VLAN ID (1–4094)" error={errs.vlanId}>
                  <Input type="number" min="1" max="4094" value={iface.vlanId} onChange={e => update(idx, 'vlanId', e.target.value)} placeholder="100" />
                </Field>
                <Field label="Parent Link" error={errs.vlanLink}>
                  <Input value={iface.vlanLink} onChange={e => update(idx, 'vlanLink', e.target.value)} placeholder="eth0" />
                </Field>
              </div>
            )}
          </div>
        )
      })}

      <button
        onClick={add}
        className="border-2 border-dashed border-gray-300 rounded-lg py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Add Interface
      </button>
    </div>
  )
}
