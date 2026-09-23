# Final_Project_pet-sitter-Client

Frontend ของ Pet Sitter ใช้ Vue 3, TypeScript และ Vite

## Pet Sitter demo while the server is pending

เปิด `/sitter/bookings?demo=true` เพื่อเปิดข้อมูลเดโมอย่างชัดเจน จากนั้น Booking List, Booking Detail, Calendar และ Payout จะใช้ booking ชุดเดียวกัน หน้า Messages ใช้แชตเดโมเสมอ ป้าย **Demo data** ระบุหน้าที่ยังไม่อ่านข้อมูลจาก server; ปุ่ม **Reset demo** ล้างสถานะ booking และบัญชีธนาคารที่เก็บในเบราว์เซอร์ ส่วน **Exit demo** กลับไปเรียก API โดยไม่มีการสลับเป็น mock อัตโนมัติ

Profile/Approval ต้องใช้บัญชี Supabase ที่ล็อกอินอยู่และส่ง access token ให้ API ส่วนการอัปโหลดรูป sitter และ booking payload ที่มี pets ยังไม่รองรับครบก่อนทดสอบ end-to-end ข้อมูลเดโมของ Payout เป็นยอดจาก booking สถานะ `success` ไม่ใช่รายการชำระเงินจริง

บน Vercel คำขอ `/api/*` จะถูก proxy ไปที่ Render ตาม `vercel.json` โดยอัตโนมัติ ไม่ต้องตั้ง `VITE_API_BASE_URL` ใน Vercel; ค่าใน `.env` ใช้เฉพาะตอน `npm run dev` ถ้าต้องการเรียก backend โดยตรงแทน Vite proxy หลังแก้ `vercel.json` ต้อง deploy frontend ใหม่

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

## Sitter approval API contract

API ส่วนตัวต้องส่ง `Authorization: Bearer <Supabase access token>`; backend ใช้ subject ใน token ระบุตัวผู้ใช้ และตรวจ `users.is_admin` สำหรับการอนุมัติหรือ API แอดมิน ไม่มีการใช้ ID จาก request header เป็นตัวตน

| Method | Endpoint | หน้าที่ |
|---|---|---|
| `GET` | `/api/sitter/profile` | อ่าน live profile, pending profile และสถานะ |
| `POST` | `/api/sitter/profile/submit` | ส่งข้อมูลเข้าคิว Verify/Approve |
| `GET` | `/api/admin/sitter-approvals` | อ่านรายการที่รอ Admin |
| `PATCH` | `/api/admin/sitter-approvals/approve?sitterId={uuid}` | อนุมัติและคัดลอก pending ไป live |
| `PATCH` | `/api/admin/sitter-approvals/reject?sitterId={uuid}` | Reject พร้อม `{ "reason": "..." }` |
| `GET` | `/api/sitters` | ค้นหาและคืนเฉพาะ Sitter ที่ `is_listed=true` |
| `GET` | `/api/sitters/map` | คืน Sitter ที่ตรง filter และมีพิกัดทั้งหมดสำหรับ Map mode |
| `GET` | `/api/sitters/{id}` | อ่าน Public Sitter Profile โดยไม่ส่งข้อมูลส่วนตัว |
| `GET` | `/api/sitters/{id}/reviews` | อ่านรีวิวที่ approved ล่าสุดสูงสุด 5 รายการ |
| `POST` | `/api/bookings` | สร้าง Booking เมื่อ Sitter ยัง listed เท่านั้น |

`pending_profile` ใช้รูปแบบเดียวกับ `ProfilePayload` และรวมข้อมูล Basic Information, Pet Sitter, Address, Pet Type, Gallery และ Payout เพื่อให้การแก้ข้อมูลของ Sitter ที่ Approved แล้วไม่ทับ live ก่อน Admin อนุมัติ ส่วน `/api/sitters` ใช้ `ListedSitterResponse` ที่ไม่ส่งข้อมูลส่วนตัว เช่น ID Number และข้อมูลธนาคาร

หน้า `/search` เรียก `/api/sitters` โดยส่ง filter ไปที่ server ทั้งหมด:

```text
GET /api/sitters?keyword=cat&petType=Cat&petType=Dog&minRating=4&experience=3-5%20Years&page=1&limit=6
```

Response เป็น object ที่มี `sitters`, `currentPage`, `totalPages`, `totalItems` และ `limit` เพื่อรองรับ server-side pagination

หน้า `/search?view=map` ใช้ `/api/sitters/map` และเก็บ filter/view ไว้ใน query string ส่วนหน้า Public Profile อยู่ที่ `/sitters/{id}` โดยแสดงที่อยู่และพิกัดจริงของ Sitter ตามข้อมูลที่ได้รับอนุมัติ
