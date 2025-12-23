import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  addMonths,
  startOfMonth,
  isWithinInterval,
  formatISO,
  parseISO,
  eachDayOfInterval,
  isSameDay,
  differenceInDays,
  addDays,
} from "date-fns";
import LZString from "lz-string";

export const MAX_GROUPS = 5;

export const GROUP_COLORS = [
  { hex: "#8a35de", rgb: "rgb(138, 53, 222)" }, // purple
  { hex: "#10a2f5", rgb: "rgb(16, 162, 245)" }, // blue
  { hex: "#eb4888", rgb: "rgb(235, 72, 136)" }, // pink
  { hex: "#e9bc3f", rgb: "rgb(233, 188, 63)" }, // yellow
  { hex: "#24d05a", rgb: "rgb(36, 208, 90)" }, // green
  // Pro colors (same as above, but with .6 alpha)
  { hex: "#8a35de99", rgb: "rgba(138, 53, 222, 0.6)" },
  { hex: "#10a2f599", rgb: "rgba(16, 162, 245, 0.6)" },
  { hex: "#eb488899", rgb: "rgba(235, 72, 136, 0.6)" },
  { hex: "#e9bc3f99", rgb: "rgba(233, 188, 63, 0.6)" },
  { hex: "#24d05a99", rgb: "rgba(36, 208, 90, 0.6)" },
];

export const getMaxGroups = (isProUser: boolean) => (isProUser ? 10 : 5);

export interface DateRange {
  start: string;
  end: string;
}

export interface EventGroup {
  id: string;
  name: string;
  color: string;
  ranges: DateRange[];
}

interface AppState {
  startDate: Date;
  includeWeekends: boolean;
  showToday: boolean;
  eventGroups: EventGroup[];
  selectedGroupId: string | null;
  showHelpModal: boolean;
  licenseKey: string | null;
  isProUser: boolean;
  firstDayOfWeek: 0 | 1; // 0 = sunday, 1 = monday
  isDarkMode: boolean;
  setFirstDayOfWeek: (day: 0 | 1) => void;
  setStartDate: (date: Date) => void;
  setIncludeWeekends: (include: boolean) => void;
  setShowToday: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
  setLicenseKey: (key: string | null) => void;
  toggleDarkMode: () => void;
  validateLicenseKey: (key: string) => Promise<boolean>;
  addEventGroup: (name: string) => EventGroup;
  updateEventGroup: (id: string, name: string) => void;
  deleteEventGroup: (id: string) => void;
  selectEventGroup: (id: string | null) => void;
  addDateRange: (groupId: string, range: DateRange) => void;
  updateDateRange: (
    groupId: string,
    oldRange: DateRange,
    newRange: DateRange
  ) => void;
  deleteDateRange: (groupId: string, rangeToDelete: DateRange) => void;
  getAppStateFromUrl: () => void;
  generateShareableUrl: () => string;
}

const defaultStartDate = startOfMonth(new Date());

// Create a function to generate the default event group
const createDefaultEventGroup = (index = 0): EventGroup => ({
  id: nanoid(),
  name: "My Events",
  color: GROUP_COLORS[index].hex,
  ranges: [],
});

// Create a function to get the default state
const getDefaultState = () => {
  const defaultGroup = createDefaultEventGroup();
  return {
    startDate: defaultStartDate,
    includeWeekends: true,
    showToday: true,
    eventGroups: [defaultGroup],
    selectedGroupId: defaultGroup.id, // Select the first group by default
    firstDayOfWeek: 0 as 0 | 1, // Default to Sunday, explicitly typed
  };
};

export const useStore = create<AppState>((set, get) => ({
  ...getDefaultState(),
  showHelpModal: false,
  licenseKey: localStorage.getItem("pocketcal_license") || null,
  isProUser: false,
  isDarkMode: localStorage.getItem("pocketcal_theme") === "dark",
  setFirstDayOfWeek: (day: 0 | 1) => set({ firstDayOfWeek: day }),

  setStartDate: (date) => set({ startDate: startOfMonth(date) }),
  setIncludeWeekends: (include) => set({ includeWeekends: include }),
  setShowToday: (show) => set({ showToday: show }),
  setShowHelpModal: (show) => set({ showHelpModal: show }),

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      localStorage.setItem("pocketcal_theme", newMode ? "dark" : "light");
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { isDarkMode: newMode };
    }),

  setLicenseKey: (key) => {
    if (key) {
      localStorage.setItem("pocketcal_license", key);
    } else {
      localStorage.removeItem("pocketcal_license");
    }
    set({ licenseKey: key });
  },

  validateLicenseKey: async (key) => {
    try {
      if (!key || key.length < 20) return false;
      const instanceName = `pocketcal-web-${window.navigator.userAgent}-${window.location.hostname}`;
      const response = await fetch("/.netlify/functions/validate-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: key,
          action: "activate",
          instanceName,
        }),
      });
      const data = await response.json();
      const valid =
        data.valid ||
        (data.license_key && data.license_key.status === "active");
      set({ isProUser: valid });
      if (valid) {
        localStorage.setItem("pocketcal_license", key);
        localStorage.setItem("pocketcal_pro_validated", Date.now().toString());
      }
      return valid;
    } catch (error) {
      console.error("License validation error:", error);
      return false;
    }
  },

  addEventGroup: (name) => {
    let newGroup: EventGroup | null = null;
    set((state) => {
      const maxGroups = getMaxGroups(state.isProUser);
      if (state.eventGroups.length >= maxGroups) {
        return state;
      }

      // Find the first unused color
      const usedColors = new Set(state.eventGroups.map((g) => g.color));
      const availableColor = GROUP_COLORS.find(
        (color) => !usedColors.has(color.hex)
      );

      if (!availableColor) {
        return state;
      }

      newGroup = {
        id: nanoid(),
        name,
        color: availableColor.hex,
        ranges: [],
      };
      return {
        eventGroups: [...state.eventGroups, newGroup],
      };
    });
    return (
      newGroup || {
        id: "",
        name: "",
        color: "",
        ranges: [],
      }
    );
  },

  updateEventGroup: (id, name) =>
    set((state) => ({
      eventGroups: state.eventGroups.map((group) =>
        group.id === id ? { ...group, name } : group
      ),
    })),

  deleteEventGroup: (id) =>
    set((state) => ({
      eventGroups: state.eventGroups.filter((group) => group.id !== id),
      selectedGroupId:
        state.selectedGroupId === id ? null : state.selectedGroupId,
    })),

  selectEventGroup: (id) => set({ selectedGroupId: id }),

  addDateRange: (groupId, range) =>
    set((state) => ({
      eventGroups: state.eventGroups.map((group) =>
        group.id === groupId
          ? { ...group, ranges: [...group.ranges, range] }
          : group
      ),
    })),

  updateDateRange: (groupId, oldRange, newRange) =>
    set((state) => ({
      eventGroups: state.eventGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              ranges: group.ranges.map((r) =>
                r.start === oldRange.start && r.end === oldRange.end
                  ? newRange
                  : r
              ),
            }
          : group
      ),
    })),

  deleteDateRange: (groupId, rangeToDelete) =>
    set((state) => ({
      eventGroups: state.eventGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              ranges: group.ranges.filter(
                (r) =>
                  !(
                    r.start === rangeToDelete.start &&
                    r.end === rangeToDelete.end
                  )
              ),
            }
          : group
      ),
    })),

  getAppStateFromUrl: () => {
    try {
      const hash = window.location.hash.substring(1);
      if (hash) {
        let decodedState;
        try {
          const decompressed = LZString.decompressFromEncodedURIComponent(hash);
          if (decompressed) {
            decodedState = JSON.parse(decompressed);
          } else {
            decodedState = JSON.parse(atob(hash));
          }
        } catch {
          decodedState = JSON.parse(atob(hash));
        }

        if (decodedState.startDate || decodedState.s) {
          if (decodedState.s) {
            const startDate = startOfMonth(parseISO(decodedState.s));
            const usedColorIndices = new Set<number>();

            const validGroups = (decodedState.g || []).filter((g: any) => {
              return g.c !== undefined && g.c >= 0 && g.c < GROUP_COLORS.length;
            });

            validGroups.forEach((g: any) => {
              usedColorIndices.add(g.c);
            });

            const eventGroups = (decodedState.g || []).map(
              (g: any, index: number) => {
                let colorIndex = g.c;

                // If no color index, invalid, or already used
                if (
                  colorIndex === undefined ||
                  colorIndex < 0 ||
                  colorIndex >= GROUP_COLORS.length
                ) {
                  for (let i = 0; i < GROUP_COLORS.length; i++) {
                    if (!usedColorIndices.has(i)) {
                      colorIndex = i;
                      usedColorIndices.add(i);
                      break;
                    }
                  }
                  // Fallback if all colors are used
                  if (colorIndex === undefined) {
                    colorIndex = index % GROUP_COLORS.length;
                  }
                }

                return {
                  id: nanoid(),
                  name: g.n || "My Events",
                  color: GROUP_COLORS[colorIndex].hex,
                  ranges: (g.r || []).map((r: any) => ({
                    start: formatISO(addDays(startDate, r[0]), {
                      representation: "date",
                    }),
                    end: formatISO(addDays(startDate, r[1]), {
                      representation: "date",
                    }),
                  })),
                };
              }
            );

            set({
              startDate,
              includeWeekends: decodedState.w ?? true,
              showToday: decodedState.t ?? true,
              eventGroups:
                eventGroups.length > 0
                  ? eventGroups
                  : [createDefaultEventGroup()],
              selectedGroupId: eventGroups[0]?.id ?? null,
              firstDayOfWeek: decodedState.f === 1 ? 1 : 0,
            });
          } else {
            const eventGroups = decodedState.eventGroups ?? [
              createDefaultEventGroup(),
            ];
            set({
              startDate: startOfMonth(parseISO(decodedState.startDate)),
              includeWeekends: decodedState.includeWeekends ?? true,
              showToday: decodedState.showToday ?? true,
              eventGroups,
              selectedGroupId: eventGroups[0]?.id ?? null,
            });
          }
        } else {
          // If no valid state in hash, use default
          set(getDefaultState());
        }
      } else {
        // If no hash, set to default state with the default group
        set(getDefaultState());
      }
    } catch (error) {
      console.error("Failed to parse state from URL:", error);
      set(getDefaultState());
    }
  },

  generateShareableUrl: () => {
    const state = get();
    const startDate = state.startDate;

    const compressedState: {
      s: string;
      w?: boolean;
      t?: boolean;
      g?: any[];
      f?: 0 | 1;
    } = {
      s: formatISO(startDate, { representation: "date" }),
      w: state.includeWeekends ? undefined : false,
      t: state.showToday ? undefined : false,
      g: state.eventGroups.map((group) => {
        const compressedGroup: any = {
          n: group.name === `My Events` ? undefined : group.name,
          c: GROUP_COLORS.findIndex((c) => c.hex === group.color),
          r: group.ranges.map((range) => [
            differenceInDays(parseISO(range.start), startDate),
            differenceInDays(parseISO(range.end), startDate),
          ]),
        };
        Object.keys(compressedGroup).forEach(
          (key) =>
            compressedGroup[key] === undefined && delete compressedGroup[key]
        );
        return compressedGroup;
      }),
      f: state.firstDayOfWeek === 0 ? undefined : state.firstDayOfWeek,
    };

    // Remove default values
    if (compressedState.w === undefined) delete compressedState.w;
    if (compressedState.t === undefined) delete compressedState.t;
    if (compressedState.g?.length === 0) delete compressedState.g;
    if (compressedState.f === undefined) delete compressedState.f;

    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(compressedState)
    );
    return `${window.location.origin}${window.location.pathname}#${compressed}`;
  },
}));

export const isDateInRange = (date: Date, group: EventGroup): boolean => {
  return group.ranges.some((range) =>
    isWithinInterval(date, {
      start: parseISO(range.start),
      end: parseISO(range.end),
    })
  );
};

export const findRangeForDate = (
  date: Date,
  group: EventGroup
): DateRange | null => {
  return (
    group.ranges.find((range) =>
      isWithinInterval(date, {
        start: parseISO(range.start),
        end: parseISO(range.end),
      })
    ) || null
  );
};

export const getCalendarDates = (startDate: Date): Date[] => {
  const endDate = addMonths(startDate, 11);
  const endOfMonthDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    0
  );
  return eachDayOfInterval({ start: startDate, end: endOfMonthDate });
};

export const formatDateDisplay = (date: Date): string => {
  return formatISO(date, { representation: "date" });
};

export const checkSameDay = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};
