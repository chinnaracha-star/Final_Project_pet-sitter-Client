import assert from 'node:assert/strict'
import test from 'node:test'
import { placeFromNominatim } from '../src/components/sitter/mapAddress.ts'

test('maps a Bangkok pin to the address boxes', () => {
  assert.deepEqual(placeFromNominatim({
    road: 'วงเวียนอนุสาวรีย์ประชาธิปไตย',
    neighbourhood: 'ชุมชนหลังวัดราชนัดดา',
    quarter: 'แขวงบวรนิเวศ',
    suburb: 'เขตพระนคร',
    city: 'กรุงเทพมหานคร',
    postcode: '10200',
  }), {
    address: 'วงเวียนอนุสาวรีย์ประชาธิปไตย',
    district: 'พระนคร',
    subDistrict: 'บวรนิเวศ',
    province: 'กรุงเทพมหานคร',
    postCode: '10200',
  })
})
