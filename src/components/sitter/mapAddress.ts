export type MapAddress = {
  address: string
  district: string
  subDistrict: string
  province: string
  postCode: string
}

function stripAdmin(value: string | undefined) {
  return (value ?? '').replace(/^(แขวง|เขต|ตำบล|อำเภอ|จังหวัด)\s*/u, '').trim()
}

export function placeFromNominatim(address: Record<string, string | undefined> | undefined): MapAddress {
  const source = address ?? {}
  const district = stripAdmin(source.suburb || source.city_district || source.county || source.town)
  const province = stripAdmin(source.state || source.province || source.city)
  return {
    address: [source.house_number, source.road || source.pedestrian].filter(Boolean).join(' '),
    district: district === province ? '' : district,
    subDistrict: stripAdmin(source.quarter || source.village || source.municipality),
    province,
    postCode: (source.postcode ?? '').trim(),
  }
}
