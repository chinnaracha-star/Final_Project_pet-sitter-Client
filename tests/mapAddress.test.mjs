import assert from 'node:assert/strict'
import test from 'node:test'
import { placeFromNominatim } from '../src/components/sitter/mapAddress.ts'

test('maps Bangkok road, district and sub-district from Nominatim', () => {
  assert.deepEqual(placeFromNominatim({
    house_number: '8/98', road: 'ซอยงามวงศ์วาน 54 แยก 7',
    quarter: 'แขวงลาดยาว', suburb: 'เขตจตุจักร', city: 'กรุงเทพมหานคร', postcode: '10900',
  }), {
    address: '8/98 ซอยงามวงศ์วาน 54 แยก 7', district: 'จตุจักร',
    subDistrict: 'ลาดยาว', province: 'กรุงเทพมหานคร', postCode: '10900',
  })
})

test('does not mistake a sub-district in suburb for the district', () => {
  const result = placeFromNominatim({
    suburb: 'แขวงบางหว้า', county: 'เขตภาษีเจริญ', city: 'กรุงเทพมหานคร', postcode: '10160',
  })
  assert.equal(result.district, 'ภาษีเจริญ')
  assert.equal(result.subDistrict, 'บางหว้า')
  assert.equal(result.address, '')
})

test('unknown address fields stay empty so a new pin cannot retain an old address', () => {
  assert.deepEqual(placeFromNominatim(undefined), {
    address: '', district: '', subDistrict: '', province: '', postCode: '',
  })
})
