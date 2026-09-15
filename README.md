# Final_Project_pet-sitter-Client

แผนที่ในหน้า Sitter Profile เป็น **preview ฝั่ง client** ด้วย Leaflet + OpenStreetMap ค้นพิกัดจากที่อยู่ที่กรอก ยังไม่บันทึก lat/lng ลง API

## Sitter approval flow

| # | การทำงาน | `approval_status` | `is_listed` | `pending_profile` | ผล |
|---|---|---|---|---|---|
| 1 | Sitter สมัคร / Become sitter | `Unverified` | `false` | `null` | เห็นแค่กล่อง 1, admin ยังไม่เห็น, จองไม่ได้ |
| 2 | กรอกกล่อง 1 แล้วกด Update | `Waiting for verify` | `false` | เก็บข้อมูลกล่อง 1 | ขึ้นคิว admin, admin เห็นกล่อง 1, จองไม่ได้ |
| 3 | Admin Approve รอบ 1 | `Verified` | `false` | เขียนลง live แล้วล้าง pending | ปลดล็อกกล่อง 2–3, จองยังไม่ได้ |
| 4 | Admin Reject รอบ 1 | `Unverified` | `false` | เก็บไว้ให้แก้ | ล็อกกล่อง 2–3 |
| 5 | กรอกกล่อง 2–3 แล้วกด Update | `Waiting for approve` | `false` | เก็บข้อมูลทั้ง 3 กล่อง | ขึ้นคิว admin เห็นครบ, จองไม่ได้ |
| 6 | Admin Approve รอบ 2 | `Approved` | `true` | คัดลอกไป live แล้วล้าง pending | ขึ้น Find Sitter, จองได้ |
| 7 | Admin Reject รอบ 2 | `Rejected` | `false` | เก็บไว้ให้แก้ | จองไม่ได้, แก้กล่อง 2–3 ได้ |
| 8 | ผู้ใช้ที่ Approved แล้วกด Update | `Waiting for approve` | `true` ค้าง | ข้อมูลใหม่เก็บที่ pending, live ไม่ทับ | Admin เห็นของใหม่, owner ยังเห็นของเก่าและจองได้ |
| 9 | Admin Approve ของข้อ 8 | `Approved` | `true` | คัดลอก pending ทับ live แล้วล้าง | Owner เพิ่งเห็นข้อมูลใหม่ |
| 10 | Admin Reject ของข้อ 8 | `Rejected` | `false` | ไม่ทับ live | หลุดจากหน้าจอง, owner ยังเห็นข้อมูลบริการเก่า |
