<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { BookingSchedule } from '../../types/booking'

const props = withDefaults(
  defineProps<{
    open?: boolean
    asModal?: boolean
    hasBackdrop?: boolean
    initialDate?: string
    initialStartTime?: string
    initialEndTime?: string
  }>(),
  {
    open: true,
    asModal: true,
    hasBackdrop: true,
    initialDate: '',
    initialStartTime: '',
    initialEndTime: '',
  }
)

const emit = defineEmits<{
  close: []
  continue: [schedule: BookingSchedule]
}>()

// Popover references for click-outside detection
const datePickerRef = ref<HTMLElement | null>(null)
const startTimePickerRef = ref<HTMLElement | null>(null)
const endTimePickerRef = ref<HTMLElement | null>(null)

// Popover state
const isDatePickerOpen = ref(false)
const isStartTimePickerOpen = ref(false)
const isEndTimePickerOpen = ref(false)

// Calculate dynamic default start and end times from current local time
function getDefaultTimes() {
  const d = new Date()
  const minutes = d.getMinutes()
  let startHour = d.getHours()
  let startMinute = minutes >= 30 ? 0 : 30
  if (minutes >= 30) {
    startHour = (startHour + 1) % 24
  }
  const formatSlot = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 === 0 ? 12 : h % 12
    const displayMinute = m === 0 ? '00' : '30'
    return `${displayHour}:${displayMinute} ${period}`
  }

  const startTime = formatSlot(startHour, startMinute)
  const endHour = (startHour + 1) % 24
  const endTime = formatSlot(endHour, startMinute)
  return { startTime, endTime }
}

const defaultTimes = getDefaultTimes()

// Default to today's date
function parseInitialDate(dateStr: string): Date {
  if (dateStr) {
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) return parsed
  }
  return new Date() // Current date
}

const selectedDate = ref<Date>(parseInitialDate(props.initialDate))
const selectedStartTime = ref(props.initialStartTime || defaultTimes.startTime)
const selectedEndTime = ref(props.initialEndTime || defaultTimes.endTime)

// Calendar State initialized to selected date
const currentYear = ref(selectedDate.value.getFullYear())
const currentMonth = ref(selectedDate.value.getMonth()) // 0 - 11

// Month names and weekdays
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const shortMonthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Formatted date string for input display: e.g. "23 Aug, 2023"
const formattedDateString = computed(() => {
  if (!selectedDate.value) return 'Select Date'
  const day = selectedDate.value.getDate()
  const month = shortMonthNames[selectedDate.value.getMonth()]
  const year = selectedDate.value.getFullYear()
  return `${day} ${month}, ${year}`
})

const currentMonthName = computed(() => monthNames[currentMonth.value])

// Calendar days computation
interface CalendarDay {
  dayNumber: number
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
}

const calendarDays = computed(() => {
  const days: CalendarDay[] = []
  const year = currentYear.value
  const month = currentMonth.value

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const today = new Date()
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i
    const d = new Date(year, month - 1, dayNumber)
    days.push({
      dayNumber,
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate.value),
    })
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const d = new Date(year, month, i)
    days.push({
      dayNumber: i,
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate.value),
    })
  }

  // Next month leading days (to fill 35 or 42 grid slots)
  const remaining = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      dayNumber: i,
      date: d,
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      isSelected: isSameDay(d, selectedDate.value),
    })
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectDay(day: CalendarDay) {
  selectedDate.value = day.date
  if (!day.isCurrentMonth) {
    currentMonth.value = day.date.getMonth()
    currentYear.value = day.date.getFullYear()
  }
  isDatePickerOpen.value = false
}

// Time slots generation (30 min increments from 6:00 AM to 10:00 PM)
const timeSlots = computed(() => {
  const slots: string[] = []
  for (let hour = 6; hour <= 22; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 22 && minute > 0) continue
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 === 0 ? 12 : hour % 12
      const displayMinute = minute === 0 ? '00' : '30'
      slots.push(`${displayHour}:${displayMinute} ${period}`)
    }
  }
  return slots
})

function toggleDatePicker() {
  isDatePickerOpen.value = !isDatePickerOpen.value
  isStartTimePickerOpen.value = false
  isEndTimePickerOpen.value = false
}

function toggleStartTimePicker() {
  isStartTimePickerOpen.value = !isStartTimePickerOpen.value
  isDatePickerOpen.value = false
  isEndTimePickerOpen.value = false
}

function toggleEndTimePicker() {
  isEndTimePickerOpen.value = !isEndTimePickerOpen.value
  isDatePickerOpen.value = false
  isStartTimePickerOpen.value = false
}

function selectStartTime(slot: string) {
  selectedStartTime.value = slot
  isStartTimePickerOpen.value = false

  // Auto-shift end time if needed (default to 1 hour after start time)
  const startIndex = timeSlots.value.indexOf(slot)
  if (startIndex !== -1 && startIndex + 2 < timeSlots.value.length) {
    selectedEndTime.value = timeSlots.value[startIndex + 2]
  }
}

function selectEndTime(slot: string) {
  selectedEndTime.value = slot
  isEndTimePickerOpen.value = false
}

function handleContinue() {
  const d = selectedDate.value
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const isoDate = `${year}-${month}-${day}`

  const schedule: BookingSchedule = {
    date: isoDate,
    formattedDate: formattedDateString.value,
    startTime: selectedStartTime.value,
    endTime: selectedEndTime.value,
  }

  emit('continue', schedule)
}

function handleClose() {
  emit('close')
}

// Click outside handler to close popovers
function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (datePickerRef.value && !datePickerRef.value.contains(target)) {
    isDatePickerOpen.value = false
  }
  if (startTimePickerRef.value && !startTimePickerRef.value.contains(target)) {
    isStartTimePickerOpen.value = false
  }
  if (endTimePickerRef.value && !endTimePickerRef.value.contains(target)) {
    isEndTimePickerOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <Teleport to="body" :disabled="!asModal">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        :class="[
          asModal
            ? 'fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto ' + (hasBackdrop ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-transparent')
            : 'relative w-full flex justify-center py-6',
        ]"
        @click.self="asModal && hasBackdrop ? handleClose() : undefined"
      >
        <!-- Modal Dialog Card with Pop Entrance -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
          appear
        >
          <div
            class="w-full max-w-[420px] rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-gray-100 transition-all text-[#1E2329]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
          >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 id="booking-modal-title" class="text-xl sm:text-[22px] font-bold text-[#1E2329] tracking-tight">
          Booking
        </h2>
        <button
          type="button"
          class="size-8 rounded-full flex items-center justify-center text-[#707687] hover:text-[#1E2329] hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
          @click="handleClose"
        >
          <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Subtitle -->
      <p class="mt-4 text-[13.5px] sm:text-[14px] text-[#707687] leading-normal font-normal">
        Select date and time you want to schedule the service.
      </p>

      <!-- Form Inputs Container -->
      <div class="mt-5 space-y-3">
        <!-- Date Input Field with Interactive Calendar Popover -->
        <div ref="datePickerRef" class="relative">
          <button
            type="button"
            class="w-full h-[48px] rounded-xl border px-3.5 flex items-center gap-3 bg-white text-left transition-all cursor-pointer select-none"
            :class="[
              isDatePickerOpen
                ? 'border-[#FF6433] ring-2 ring-[#FF6433]/20 shadow-sm'
                : 'border-[#E0E2E7] hover:border-[#FF6433]/70',
            ]"
            aria-haspopup="dialog"
            :aria-expanded="isDatePickerOpen"
            @click.stop="toggleDatePicker"
          >
            <!-- Calendar Icon -->
            <svg class="size-[18px] text-[#707687] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span class="text-[14px] font-medium text-[#1E2329]">
              {{ formattedDateString }}
            </span>
          </button>

          <!-- Calendar Popover Dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="transform opacity-0 scale-95 -translate-y-1"
            enter-to-class="transform opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="transform opacity-100 scale-100 translate-y-0"
            leave-to-class="transform opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="isDatePickerOpen"
              class="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 text-[#1E2329]"
              @click.stop
            >
              <!-- Month Navigator -->
              <div class="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  class="size-8 rounded-full flex items-center justify-center text-[#707687] hover:text-[#1E2329] hover:bg-gray-100 transition-colors"
                  aria-label="Previous Month"
                  @click="prevMonth"
                >
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <span class="text-[14.5px] font-bold text-[#1E2329]">
                  {{ currentMonthName }} {{ currentYear }}
                </span>

                <button
                  type="button"
                  class="size-8 rounded-full flex items-center justify-center text-[#707687] hover:text-[#1E2329] hover:bg-gray-100 transition-colors"
                  aria-label="Next Month"
                  @click="nextMonth"
                >
                  <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <!-- Day of Week Headers -->
              <div class="grid grid-cols-7 text-center mb-1">
                <span
                  v-for="wd in weekDays"
                  :key="wd"
                  class="text-[11.5px] font-semibold text-[#82869B] py-1"
                >
                  {{ wd }}
                </span>
              </div>

              <!-- Days Matrix Grid -->
              <div class="grid grid-cols-7 gap-y-1 text-center">
                <button
                  v-for="(day, idx) in calendarDays"
                  :key="idx"
                  type="button"
                  class="size-8 mx-auto flex items-center justify-center text-[13px] rounded-full transition-all cursor-pointer"
                  :class="[
                    day.isSelected
                      ? 'bg-[#FF6433] text-white font-bold shadow-sm'
                      : day.isCurrentMonth
                        ? 'text-[#1E2329] hover:bg-[#FFF2EC] hover:text-[#FF6433] font-medium'
                        : 'text-gray-300 hover:text-gray-500',
                    day.isToday && !day.isSelected ? 'border border-[#FF6433] text-[#FF6433] font-semibold' : '',
                  ]"
                  @click="selectDay(day)"
                >
                  {{ day.dayNumber }}
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Time Selector Row -->
        <div class="flex items-center gap-2.5">
          <!-- Start Time Input -->
          <div ref="startTimePickerRef" class="relative flex-1">
            <button
              type="button"
              class="w-full h-[48px] rounded-xl border px-3.5 flex items-center gap-2.5 bg-white text-left transition-all cursor-pointer select-none"
              :class="[
                isStartTimePickerOpen
                  ? 'border-[#FF6433] ring-2 ring-[#FF6433]/20 shadow-sm'
                  : 'border-[#E0E2E7] hover:border-[#FF6433]/70',
              ]"
              aria-haspopup="listbox"
              :aria-expanded="isStartTimePickerOpen"
              @click.stop="toggleStartTimePicker"
            >
              <!-- Clock Icon -->
              <svg class="size-[18px] text-[#707687] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span class="text-[14px] font-medium text-[#1E2329] truncate">
                {{ selectedStartTime }}
              </span>
            </button>

            <!-- Start Time Dropdown Popover -->
            <Transition
              enter-active-class="transition ease-out duration-150"
              enter-from-class="transform opacity-0 scale-95 -translate-y-1"
              enter-to-class="transform opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-100"
              leave-from-class="transform opacity-100 scale-100 translate-y-0"
              leave-to-class="transform opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="isStartTimePickerOpen"
                class="absolute left-0 w-[180px] top-full mt-2 z-30 max-h-56 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl border border-gray-100 text-[#1E2329]"
                @click.stop
              >
                <div class="px-2 py-1 text-[11px] font-semibold text-[#82869B] uppercase tracking-wider">
                  Start Time
                </div>
                <button
                  v-for="slot in timeSlots"
                  :key="slot"
                  type="button"
                  class="w-full text-left px-3 py-1.5 text-[13px] rounded-lg transition-colors cursor-pointer"
                  :class="[
                    selectedStartTime === slot
                      ? 'bg-[#FF6433] text-white font-bold'
                      : 'text-[#1E2329] hover:bg-[#FFF2EC] hover:text-[#FF6433]',
                  ]"
                  @click="selectStartTime(slot)"
                >
                  {{ slot }}
                </button>
              </div>
            </Transition>
          </div>

          <!-- Dash Separator -->
          <span class="text-[#707687] text-base font-medium px-0.5 select-none">-</span>

          <!-- End Time Input -->
          <div ref="endTimePickerRef" class="relative flex-1">
            <button
              type="button"
              class="w-full h-[48px] rounded-xl border px-3.5 flex items-center justify-center bg-white text-center transition-all cursor-pointer select-none"
              :class="[
                isEndTimePickerOpen
                  ? 'border-[#FF6433] ring-2 ring-[#FF6433]/20 shadow-sm'
                  : 'border-[#E0E2E7] hover:border-[#FF6433]/70',
              ]"
              aria-haspopup="listbox"
              :aria-expanded="isEndTimePickerOpen"
              @click.stop="toggleEndTimePicker"
            >
              <span class="text-[14px] font-medium text-[#1E2329] truncate">
                {{ selectedEndTime }}
              </span>
            </button>

            <!-- End Time Dropdown Popover -->
            <Transition
              enter-active-class="transition ease-out duration-150"
              enter-from-class="transform opacity-0 scale-95 -translate-y-1"
              enter-to-class="transform opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-100"
              leave-from-class="transform opacity-100 scale-100 translate-y-0"
              leave-to-class="transform opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="isEndTimePickerOpen"
                class="absolute right-0 w-[180px] top-full mt-2 z-30 max-h-56 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl border border-gray-100 text-[#1E2329]"
                @click.stop
              >
                <div class="px-2 py-1 text-[11px] font-semibold text-[#82869B] uppercase tracking-wider">
                  End Time
                </div>
                <button
                  v-for="slot in timeSlots"
                  :key="slot"
                  type="button"
                  class="w-full text-left px-3 py-1.5 text-[13px] rounded-lg transition-colors cursor-pointer"
                  :class="[
                    selectedEndTime === slot
                      ? 'bg-[#FF6433] text-white font-bold'
                      : 'text-[#1E2329] hover:bg-[#FFF2EC] hover:text-[#FF6433]',
                  ]"
                  @click="selectEndTime(slot)"
                >
                  {{ slot }}
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <button
        type="button"
        class="w-full h-[48px] sm:h-[50px] mt-6 rounded-2xl bg-[#FF6433] hover:bg-[#E2480A] text-white font-bold text-[15px] shadow-md shadow-[#FF6433]/25 hover:shadow-lg hover:shadow-[#FF6433]/35 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer select-none"
        @click="handleContinue"
      >
        Continue
      </button>
    </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
