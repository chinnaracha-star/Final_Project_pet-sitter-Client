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
  const administrativeNames = [source.city_district, source.county, source.suburb, source.town, source.quarter, source.village, source.municipality]
  const district = stripAdmin(
    administrativeNames.find(value => /^(เขต|อำเภอ)/u.test(value ?? ''))
      || source.city_district || source.county || source.suburb || source.town,
  )
  const province = stripAdmin(source.state || source.province || source.city)
  return {
    address: [source.house_number, source.road || source.pedestrian].filter(Boolean).join(' '),
    district: district === province ? '' : district,
    subDistrict: stripAdmin(
      administrativeNames.find(value => /^(แขวง|ตำบล)/u.test(value ?? ''))
        || source.quarter || source.village || source.municipality || source.neighbourhood,
    ),
    province,
    postCode: (source.postcode ?? '').trim(),
  }
}
