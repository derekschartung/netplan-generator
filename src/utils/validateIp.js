const IPV4_CIDR = /^(\d{1,3}\.){3}\d{1,3}\/(\d|[1-2]\d|3[0-2])$/

export function isValidCidr(value) {
  if (!IPV4_CIDR.test(value)) return false
  return value.split('/')[0].split('.').every(o => Number(o) <= 255)
}

export function isValidIp(value) {
  const re = /^(\d{1,3}\.){3}\d{1,3}$/
  return re.test(value) && value.split('.').every(o => Number(o) <= 255)
}

export function isValidCidr6(value) {
  if (!value.includes(':')) return false
  const parts = value.split('/')
  if (parts.length !== 2) return false
  const prefix = Number(parts[1])
  return Number.isInteger(prefix) && prefix >= 0 && prefix <= 128
}
