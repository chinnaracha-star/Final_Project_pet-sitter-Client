<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AddressMap from "./AddressMap.vue";
import ProfileGallery from "./ProfileGallery.vue";
import { getProfileUiState } from "./profileFlow";
import {
  currentSitterId,
  getOwnProfile,
  submitProfile as submitSitterProfile,
  type ApprovalStatus,
  type ProfilePayload,
  type ProfileResponse,
} from "../../services/sitterApproval";

const PET_TYPES = ["Dog", "Cat", "Bird", "Rabbit"];

const fullName = defineModel<string>("fullName", { required: true });

const route = useRoute();
const userId = currentSitterId();
const demoStatuses: Record<string, ApprovalStatus> = {
  unverified: "Unverified",
  waiting: "Waiting for approve",
  "waiting-for-verify": "Waiting for verify",
  verified: "Verified",
  approved: "Approved",
  "rejected-first": "Unverified",
  rejected: "Rejected",
};
const demoStatusKey = String(route.query.status);
const status = ref<ApprovalStatus>(
  !userId && demoStatuses[demoStatusKey]
    ? demoStatuses[demoStatusKey]
    : "Unverified",
);

const phone = ref("");
const email = ref("");
const experience = ref("");
const dateOfBirth = ref("");
const idNumber = ref("");
const introduction = ref("");
const sitterName = ref("");
const petTypes = ref<string[]>([]);
const services = ref("");
const myPlace = ref("");
const address = ref("");
const district = ref("");
const subDistrict = ref("");
const province = ref("");
const postCode = ref("");
const latitude = ref<number | null>(null);
const longitude = ref<number | null>(null);
const bankName = ref("");
const accountName = ref("");
const accountNumber = ref("");
const bankCode = ref("");
const bookBankImageUrl = ref("");
const avatarUrl = ref("");
const photoUrls = ref<string[]>([]);
const notice = ref("");
const photoInput = ref<HTMLInputElement | null>(null);
const rejectionReason = ref(
  !userId && demoStatusKey.startsWith("rejected")
    ? "Please update the information and submit it again."
    : "",
);
const loading = ref(false);
const uiState = computed(() => getProfileUiState(status.value, rejectionReason.value));
const showFullProfile = computed(() => uiState.value.showFullProfile);
const statusClass = computed(() =>
  uiState.value.displayStatus.toLowerCase().replaceAll(" ", "-"),
);
function setCoordinates(nextLatitude: number | null, nextLongitude: number | null) {
  latitude.value = nextLatitude;
  longitude.value = nextLongitude;
}

function changeAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 5_000_000) {
    notice.value = "รองรับเฉพาะไฟล์รูปภาพขนาดไม่เกิน 5 MB";
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => (avatarUrl.value = String(reader.result));
  reader.readAsDataURL(file);
  input.value = "";
}

function fillForm(payload: ProfilePayload) {
  fullName.value = payload.fullName || "";
  phone.value = payload.phone || "";
  email.value = payload.email || "";
  experience.value = payload.experienceYears || "";
  dateOfBirth.value = payload.dateOfBirth || "";
  idNumber.value = payload.idNumber || "";
  avatarUrl.value = payload.avatarUrl || "";
  introduction.value = payload.introduction || "";
  sitterName.value = payload.displayName || "";
  petTypes.value = [...payload.petTypes];
  services.value = payload.services || "";
  myPlace.value = payload.myPlace || "";
  photoUrls.value = [...payload.photoUrls];
  address.value = payload.addressDetail || "";
  district.value = payload.district || "";
  subDistrict.value = payload.subDistrict || "";
  province.value = payload.province || "";
  postCode.value = payload.postCode || "";
  latitude.value = payload.latitude;
  longitude.value = payload.longitude;
  bankName.value = payload.bankName || "";
  accountName.value = payload.accountName || "";
  accountNumber.value = payload.accountNumber || "";
  bankCode.value = payload.bankCode || "";
  bookBankImageUrl.value = payload.bookBankImageUrl || "";
}

function applyResponse(response: ProfileResponse) {
  status.value = response.approvalStatus;
  rejectionReason.value = response.rejectionReason || "";
  fillForm(response.pendingProfile || response.profile);
}

function payload(): ProfilePayload {
  return {
    fullName: fullName.value,
    phone: phone.value,
    email: email.value,
    experienceYears: experience.value,
    dateOfBirth: dateOfBirth.value || null,
    idNumber: idNumber.value,
    avatarUrl: avatarUrl.value,
    introduction: introduction.value,
    displayName: sitterName.value,
    petTypes: petTypes.value,
    services: services.value,
    myPlace: myPlace.value,
    photoUrls: photoUrls.value,
    addressDetail: address.value,
    district: district.value,
    subDistrict: subDistrict.value,
    province: province.value,
    postCode: postCode.value,
    latitude: latitude.value,
    longitude: longitude.value,
    bankName: bankName.value,
    accountName: accountName.value,
    accountNumber: accountNumber.value,
    bankCode: bankCode.value,
    bookBankImageUrl: bookBankImageUrl.value,
  };
}

async function submitProfile() {
  if (showFullProfile.value && petTypes.value.length === 0) {
    notice.value = "เลือก Pet type อย่างน้อย 1 ประเภท";
    return;
  }
  if (!userId) {
    notice.value = "เข้าสู่ระบบด้วยบัญชี Sitter เพื่อเชื่อมต่อ API";
    return;
  }
  loading.value = true;
  try {
    applyResponse(await submitSitterProfile(payload()));
    notice.value = "ส่งข้อมูลให้ Admin ตรวจสอบแล้ว";
  } catch (error) {
    notice.value = error instanceof Error ? error.message : "ไม่สามารถส่งข้อมูลได้";
  } finally {
    loading.value = false;
  }
}

function removePetType(pet: string) {
  petTypes.value = petTypes.value.filter((selectedPet) => selectedPet !== pet);
}

watch(
  () => route.query.status,
  (value) => {
    if (userId) return;
    const key = String(value);
    const next = demoStatuses[key];
    if (next) {
      status.value = next;
      rejectionReason.value = key.startsWith("rejected")
        ? "Please update the information and submit it again."
        : "";
    }
  },
);

onMounted(async () => {
  if (!userId) return;
  loading.value = true;
  try {
    applyResponse(await getOwnProfile());
  } catch (error) {
    notice.value = error instanceof Error ? error.message : "ไม่สามารถโหลดโปรไฟล์ได้";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="profile-content">
    <div class="page-heading">
      <div>
        <h1 class="text-2xl font-bold">Pet Sitter Profile</h1>
        <span class="status" :class="statusClass">{{ uiState.displayStatus }}</span>
      </div>
      <button
        v-if="uiState.canSubmit"
        type="submit"
        form="profile-form"
        class="approval-button"
        :disabled="loading || !userId"
      >
        {{ uiState.actionText }}
      </button>
    </div>
    <p v-if="!userId" class="demo-notice" role="status">
      {{ demoStatuses[demoStatusKey] ? 'Demo profile state. Saving requires the sitter API and a signed-in sitter account.' : 'Server integration pending. Sign in as a sitter to load and save a real profile.' }}
    </p>
    <p v-if="rejectionReason" class="rejection" role="status">
      <img src="/icon/info-circle.svg" alt="" width="20" height="20" />
      Your request has not been approved: '{{ rejectionReason }}'
    </p>
    <p v-if="status === 'Approved'" class="approved-note">
      Your sitter profile is listed. New edits will need approval before they
      appear publicly.
    </p>
    <p v-if="notice" class="demo-notice" role="status">{{ notice }}</p>

    <form id="profile-form" @submit.prevent="submitProfile">
      <fieldset class="profile-fields" :disabled="loading || uiState.readOnly">
      <section class="card">
        <h2>Basic Information</h2>
        <label class="image-label">Profile Image</label>
        <div class="avatar-picker">
          <div class="avatar-placeholder" aria-label="Profile image">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Selected profile" />
            <img v-else class="avatar-fallback" src="/icon/user.svg" alt="" />
          </div>
          <button
            v-if="!uiState.readOnly"
            type="button"
            class="add-avatar"
            aria-label="Choose profile image"
            @click="photoInput?.click()"
          >
            ＋
          </button>
          <input
            ref="photoInput"
            class="visually-hidden"
            type="file"
            accept="image/*"
            aria-label="Profile image"
            @change="changeAvatar"
          />
        </div>
        <div class="fields">
          <div class="field">
            <label for="full-name">Your full name <b>*</b></label>
            <input
              id="full-name"
              v-model.trim="fullName"
              autocomplete="name"
              required
            />
          </div>
          <div class="field">
            <label for="experience">Experience <b>*</b></label>
            <select id="experience" v-model="experience" required>
              <option value="" disabled>Select experience</option>
              <option>0–1 year</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5+ years</option>
            </select>
          </div>
          <div class="field">
            <label for="phone">Phone Number <b>*</b></label>
            <input
              id="phone"
              v-model.trim="phone"
              type="tel"
              autocomplete="tel"
              required
            />
          </div>
          <div class="field">
            <label for="email">Email <b>*</b></label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              autocomplete="email"
              required
            />
          </div>
          <div class="field">
            <label for="dob">Date of Birth <b>*</b></label>
            <input id="dob" v-model="dateOfBirth" type="date" required />
          </div>
          <div class="field">
            <label for="id-number">ID Number <b>*</b></label>
            <input
              id="id-number"
              v-model.trim="idNumber"
              inputmode="numeric"
              required
            />
          </div>
          <div class="field wide">
            <label for="intro"
              >Introduction (Describe about yourself as pet sitter)</label
            >
            <textarea id="intro" v-model.trim="introduction" rows="5" />
          </div>
        </div>
      </section>

      <section v-if="showFullProfile" class="card">
        <h2>Pet Sitter</h2>
        <div class="fields">
          <div class="field">
            <label for="sitter-name"
              >Pet sitter name (Trade Name) <b>*</b></label
            >
            <input id="sitter-name" v-model.trim="sitterName" required />
          </div>
          <fieldset class="field wide pet-types">
            <legend>Pet type <b>*</b></legend>
            <details
              class="pet-type-select"
              :class="{ 'is-disabled': uiState.readOnly }"
              @click="uiState.readOnly && $event.preventDefault()"
            >
              <summary>
                <span v-if="petTypes.length === 0" class="pet-placeholder">
                  Select pet type
                </span>
                <span v-else class="pet-chips">
                  <span v-for="pet in petTypes" :key="pet" class="pet-chip">
                    {{ pet }}
                    <button
                      type="button"
                      :aria-label="`Remove ${pet}`"
                      @click.stop.prevent="removePetType(pet)"
                    >
                      ×
                    </button>
                  </span>
                </span>
              </summary>
              <div class="pet-options">
                <label v-for="pet in PET_TYPES" :key="pet">
                  <input v-model="petTypes" type="checkbox" :value="pet" />
                  {{ pet }}
                </label>
              </div>
            </details>
          </fieldset>
          <div class="field wide">
            <label for="services"
              >Services (Describe your service for pet sitting)</label
            >
            <textarea id="services" v-model.trim="services" rows="4" />
          </div>
          <div class="field wide">
            <label for="my-place">My Place (Describe your place)</label>
            <textarea id="my-place" v-model.trim="myPlace" rows="4" />
          </div>
          <ProfileGallery v-model="photoUrls" :readonly="uiState.readOnly" />
        </div>
      </section>

      <section v-if="showFullProfile" class="card">
        <h2>Address</h2>
        <div class="fields">
          <div class="field wide">
            <label for="address">Address detail <b>*</b></label>
            <input id="address" v-model.trim="address" required />
          </div>
          <div class="field">
            <label for="district">District <b>*</b></label>
            <input id="district" v-model.trim="district" required />
          </div>
          <div class="field">
            <label for="sub-district">Sub-district <b>*</b></label>
            <input id="sub-district" v-model.trim="subDistrict" required />
          </div>
          <div class="field">
            <label for="province">Province <b>*</b></label>
            <input id="province" v-model.trim="province" required />
          </div>
          <div class="field">
            <label for="post-code">Post code <b>*</b></label>
            <input
              id="post-code"
              v-model.trim="postCode"
              inputmode="numeric"
              required
            />
          </div>
        </div>
        <AddressMap
          :address="address"
          :district="district"
          :sub-district="subDistrict"
          :province="province"
          :post-code="postCode"
          :latitude="latitude"
          :longitude="longitude"
          @coordinates="setCoordinates"
        />
      </section>
      </fieldset>
      <div v-if="uiState.canSubmit" class="form-actions">
        <button type="submit" :disabled="loading || !userId">{{ uiState.actionText }}</button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.profile-content {
  width: min(100% - 56px, 1120px);
  margin: 32px auto 60px;
}
.page-heading {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-heading > div {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
h1 {
  margin: 0;
  font-size: 26px;
}
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ec6d85;
}
.status::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.status.approved {
  color: #16a86f;
}
.status.rejected {
  color: #e34b4b;
}
.approval-button,
.form-actions button {
  padding: 12px 20px;
  border: 0;
  border-radius: 24px;
  background: #ff713e;
  color: white;
  font-weight: 700;
}
.rejection,
.approved-note,
.demo-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-radius: 7px;
  background: #e8ebf8;
  color: #dc4451;
}
.rejection img {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  filter: invert(32%) sepia(63%) saturate(2148%) hue-rotate(330deg) brightness(96%);
}
.approved-note {
  color: #168e62;
  background: #eaf8f0;
}
.demo-notice {
  color: #454d5f;
  background: #fff1e9;
}
.card {
  margin-bottom: 20px;
  padding: 34px;
  border-radius: 12px;
  background: white;
}
h2 {
  margin: 0 0 26px;
  color: #9299ad;
  font-size: 20px;
}
.image-label {
  display: block;
  margin-bottom: 15px;
  color: #222;
  font-weight: 600;
}
.avatar-picker {
  position: relative;
  width: 210px;
  margin-bottom: 28px;
}
.avatar-placeholder {
  display: grid;
  place-items: center;
  width: 210px;
  height: 210px;
  overflow: hidden;
  border-radius: 50%;
  background: #e6e8f6;
}
.avatar-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-placeholder .avatar-fallback {
  width: 96px;
  height: 96px;
  object-fit: contain;
}
.add-avatar {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  color: #ff713e;
  background: #fff2eb;
  font-size: 30px;
}
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
}
.field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.field.wide {
  grid-column: 1 / -1;
}
.field > label,
legend {
  color: #222;
  font-size: 15px;
  font-weight: 600;
}
.field b,
legend b {
  color: #ed3d4a;
}
.field input:not([type="checkbox"]),
.field select,
.field textarea {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid #d8ddef;
  border-radius: 7px;
  color: #30343f;
  background: white;
}
.field select {
  appearance: none;
  padding-right: 42px;
  background: white url("/icon/chevron-down.svg") no-repeat right 16px center;
  background-size: 14px 8px;
}
.field textarea {
  resize: vertical;
}
.pet-types {
  padding: 0;
  border: 0;
}
.profile-fields {
  min-width: 0;
  padding: 0;
  border: 0;
}
.profile-fields:disabled {
  opacity: 0.75;
}
.pet-types legend {
  margin-bottom: 9px;
}
.pet-type-select {
  position: relative;
}
.pet-type-select.is-disabled summary {
  cursor: default;
}
.pet-type-select summary {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 7px 42px 7px 8px;
  border: 1px solid #d8ddef;
  border-radius: 7px;
  background: white;
  cursor: pointer;
  list-style: none;
}
.pet-type-select summary::-webkit-details-marker {
  display: none;
}
.pet-type-select summary::after {
  content: "";
  position: absolute;
  right: 16px;
  width: 14px;
  height: 8px;
  background: url("/icon/chevron-down.svg") no-repeat center / contain;
  transition: transform 0.15s ease;
}
.pet-type-select[open] summary::after {
  transform: rotate(180deg);
}
.pet-placeholder {
  padding-left: 6px;
  color: #9299ad;
}
.pet-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.pet-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 18px;
  color: #f4512c;
  background: #fff0eb;
}
.pet-chip button {
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.pet-options {
  position: absolute;
  z-index: 10;
  top: calc(100% + 5px);
  width: 100%;
  padding: 8px;
  border: 1px solid #d8ddef;
  border-radius: 7px;
  background: white;
  box-shadow: 0 8px 20px rgb(48 52 63 / 12%);
}
.pet-options label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px;
  border-radius: 5px;
  cursor: pointer;
}
.pet-options label:hover {
  background: #fff7f3;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
@media (max-width: 760px) {
  .profile-content {
    width: min(100% - 28px, 1120px);
  }
  .card {
    padding: 22px;
  }
  .fields {
    grid-template-columns: 1fr;
  }
  .field.wide {
    grid-column: 1;
  }
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
