import React, { useMemo, useEffect, useState, memo } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { format, isWeekend, eachDayOfInterval } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, FileDown, Sun, Moon, RotateCcw, Eraser, Settings2, ArrowRight, ArrowLeft } from "lucide-react";
import { generateDTRExcel, type DTRFormData } from "@/lib/generate-excel";

const LOCAL_STORAGE_KEY = "dtr-form-data";

const DTRTableRow = memo(({ 
  index, 
  date, 
  chronIndex, 
  control, 
  register, 
  setValue, 
  copyPreviousDay, 
  resetDay, 
  setDayType 
}: {
  index: number;
  date: Date;
  chronIndex: number;
  control: any;
  register: any;
  setValue: any;
  copyPreviousDay: (i: number) => void;
  resetDay: (i: number) => void;
  setDayType: (i: number, t: "work" | "off" | "holiday") => void;
}) => {
  const rowData = useWatch({
    control,
    name: `days.${index}`
  });
  
  const rawType = rowData?.dayType;
  const isDayOff = rawType === "off" || rowData?.dayOff === true;
  const isHoliday = rawType === "holiday";
  const isNonWork = isDayOff || isHoliday;
  
  const isWknd = isWeekend(date);
  const dayName = format(date, 'EEE');
  const currentDayStr = `${date.getDate()}`;

  const renderTimeCell = (fieldName: string, tabIndex: number, bgClass: string = "") => {
    const isOff = (rowData as any)?.[fieldName] === "OFF";
    return (
      <TableCell className={`p-1 border-r dark:border-slate-700 ${bgClass}`}>
        <div className="relative group w-full h-full flex items-center justify-center">
          {isOff ? (
            <div 
              className="h-9 w-full min-w-24 flex items-center justify-center text-xs md:text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-transparent rounded cursor-pointer transition-colors hover:border-red-300 dark:hover:border-red-700"
              onClick={() => setValue(`days.${index}.${fieldName}`, "")}
              title="Click to change back to time"
            >
              OFF
            </div>
          ) : (
            <>
              <Input 
                type="time"
                title=" "
                {...register(`days.${index}.${fieldName}`)} 
                className="h-9 w-full min-w-24 px-2 text-xs md:text-sm text-center border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 shadow-none bg-transparent focus:bg-white dark:focus:bg-slate-800 dark:text-slate-200 transition-all rounded pr-8"
                tabIndex={tabIndex}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setValue(`days.${index}.${fieldName}`, "OFF");
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/60 dark:hover:text-red-400 transition-all z-0 cursor-pointer shadow-sm"
                title="Set as OFF"
              >
                OFF
              </button>
            </>
          )}
        </div>
      </TableCell>
    );
  };

  return (
    <TableRow 
      className={`
        border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50
        ${isDayOff ? 'bg-red-50/40 dark:bg-red-950/30' : ''}
        ${isHoliday ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''}
        ${isWknd && !isNonWork ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}
      `}
    >
      <TableCell className="sticky left-0 z-10 font-medium text-center border-r dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2 min-h-[3.5rem] shadow-[1px_0_0_0_transparent]">
        <div className="flex flex-col items-center justify-center">
          <span className={`text-base leading-none ${isDayOff ? 'text-red-400 dark:text-red-500' : isHoliday ? 'text-green-700 dark:text-green-400' : isWknd ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>{currentDayStr}</span>
          {dayName && <span className={`text-[10px] sm:text-xs mt-1 font-semibold tracking-widest uppercase ${isDayOff ? 'text-red-400 dark:text-red-500' : isHoliday ? 'text-green-600 dark:text-green-400' : isWknd ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>{dayName}</span>}
        </div>
      </TableCell>

      <TableCell className="p-1 border-r dark:border-slate-700 text-center">
        <div className="flex items-center justify-center">
          <Select
            value={rawType || (rowData?.dayOff ? "off" : "work")}
            onValueChange={(value) => setDayType(index, value as "work" | "off" | "holiday")}
          >
            <SelectTrigger className="h-8 w-full px-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all rounded outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-between font-medium">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="off">Off</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableCell>
      
      {isNonWork ? (
        <TableCell colSpan={6} className="p-1 border-r dark:border-slate-700 text-center">
          <div className="h-9 flex items-center justify-center">
            <span className={`text-sm font-bold tracking-widest ${isHoliday ? 'text-green-500 dark:text-green-500' : 'text-red-500 dark:text-red-500'} uppercase select-none`}>{isHoliday ? 'HOLIDAY' : 'OFF'}</span>
          </div>
        </TableCell>
      ) : (
        <>
          {renderTimeCell("morningArrival", chronIndex * 6 + 1)}
          {renderTimeCell("morningDeparture", chronIndex * 6 + 2, "bg-slate-50/30 dark:bg-slate-800/20")}
          {renderTimeCell("afternoonArrival", chronIndex * 6 + 3)}
          {renderTimeCell("afternoonDeparture", chronIndex * 6 + 4, "bg-slate-50/30 dark:bg-slate-800/20")}
          
          <TableCell className="p-1 border-r dark:border-slate-700">
            <Input 
              {...register(`days.${index}.overtimeHours`)} 
              placeholder="..."
              maxLength={9} 
              className="h-9 w-full min-w-20 px-2 text-xs md:text-sm text-center border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 shadow-none bg-transparent focus:bg-white dark:focus:bg-slate-800 transition-all rounded text-slate-500 dark:text-slate-400"
              tabIndex={chronIndex * 6 + 5}
            />
          </TableCell>
          <TableCell className="p-1 border-r dark:border-slate-700">
             <Input 
              {...register(`days.${index}.overtimeMinutes`)} 
              placeholder="E.g. 8AM-5PM"
              maxLength={9}
              className="h-9 w-full min-w-16 px-2 text-xs md:text-sm text-center border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 shadow-none bg-transparent focus:bg-white dark:focus:bg-slate-800 transition-all rounded text-slate-500 dark:text-slate-400"
              tabIndex={chronIndex * 6 + 6}
            />
          </TableCell>
        </>
      )}
      
      <TableCell className="p-1">
        <div className="flex items-center justify-center gap-1 h-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 shrink-0 text-gray-400/75 dark:text-gray-400/75 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 ${chronIndex === 0 ? 'invisible' : ''}`}
                onClick={() => copyPreviousDay(chronIndex)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy previous day's inputs</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0 text-gray-400/75 dark:text-gray-400/75 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                onClick={() => resetDay(index)}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset this row</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
});

const getInitialFormValues = (): DTRFormData => {
  const currentMonthDate = new Date();
  const defaultValues: DTRFormData = {
    name: "",
    leftPeriod: { from: currentMonthDate, to: currentMonthDate },
    rightPeriod: { from: currentMonthDate, to: currentMonthDate },
    leftOfficialHours: "",
    rightOfficialHours: "",
    leftRegularDaysHours: "",
    rightRegularDaysHours: "",
    leftSaturdaysHours: "",
    rightSaturdaysHours: "",
    days: Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      dayType: "work" as const,
      dayOff: false,
      morningArrival: "",
      morningDeparture: "",
      afternoonArrival: "",
      afternoonDeparture: "",
      overtimeHours: "",
      overtimeMinutes: "",
    })),
  };

  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.leftPeriod?.from) parsed.leftPeriod.from = new Date(parsed.leftPeriod.from);
      if (parsed.leftPeriod?.to) parsed.leftPeriod.to = new Date(parsed.leftPeriod.to);
      if (parsed.rightPeriod?.from) parsed.rightPeriod.from = new Date(parsed.rightPeriod.from);
      if (parsed.rightPeriod?.to) parsed.rightPeriod.to = new Date(parsed.rightPeriod.to);
      return { ...defaultValues, ...parsed };
    }
  } catch (err) {
    console.error("Failed to parse local storage form data", err);
  }
  return defaultValues;
};


export default function App() {

  // ── Dark Mode ──
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("dtr-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("dtr-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("dtr-theme", "light");
    }
  }, [isDark]);

  const { register, control, watch, getValues, setValue, handleSubmit, reset, formState: { errors } } = useForm<DTRFormData>({
    defaultValues: getInitialFormValues(),
  });

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const { append, remove, replace } = useFieldArray({
    control,
    name: "days",
  });

  const leftPeriodValue = watch("leftPeriod");
  const rightPeriodValue = watch("rightPeriod");

  const [emptyWarnOpen, setEmptyWarnOpen] = useState(false);
  const [pendingData, setPendingData] = useState<DTRFormData | null>(null);

  // Keep 31 days statically since periods can span into longer chunks

  const sortedDates = useMemo(() => {
    const dates: Date[] = [];
    if (leftPeriodValue?.from) {
      const end = leftPeriodValue.to || leftPeriodValue.from;
      dates.push(...eachDayOfInterval({ start: leftPeriodValue.from, end }));
    }
    if (rightPeriodValue?.from) {
      const end = rightPeriodValue.to || rightPeriodValue.from;
      dates.push(...eachDayOfInterval({ start: rightPeriodValue.from, end }));
    }

    const uniqueMap = new Map<string, Date>();
    dates.forEach(d => {
      uniqueMap.set(format(d, 'yyyy-MM-dd'), d);
    });
    
    return Array.from(uniqueMap.values()).sort((a, b) => a.getTime() - b.getTime());
  }, [leftPeriodValue, rightPeriodValue]);

  const groupedDates = useMemo(() => {
    const groups: { monthStr: string, dates: { date: Date, chronIndex: number }[] }[] = [];
    sortedDates.forEach((d, i) => {
      const mStr = format(d, 'MMMM yyyy');
      let group = groups.find(g => g.monthStr === mStr);
      if (!group) {
        group = { monthStr: mStr, dates: [] };
        groups.push(group);
      }
      group.dates.push({ date: d, chronIndex: i });
    });
    return groups;
  }, [sortedDates]);

  const onFormError = () => {
    toast.error("Missing Employee Information", {
      position: 'top-center',
      closeButton: false,
      description: "Please fill in all required fields highlighted in red.",
    });
  };

  const onSubmit = async (data: DTRFormData) => {
    // Check if there are any actual time entries or statuses in the valid dates
    const hasAnyEntry = sortedDates.some(d => {
      const dayData = data.days[d.getDate() - 1];
      if (!dayData) return false; 
      return !!dayData.morningArrival || 
             !!dayData.morningDeparture || 
             !!dayData.afternoonArrival || 
             !!dayData.afternoonDeparture || 
             !!dayData.overtimeHours || 
             !!dayData.overtimeMinutes ||
             dayData.dayType === 'off' ||
             dayData.dayType === 'holiday';
    });

    if (!hasAnyEntry) {
      setPendingData(data);
      setEmptyWarnOpen(true);
      return;
    }

    await generateExcelSubmission(data);
  };

  const generateExcelSubmission = async (data: DTRFormData) => {
    setEmptyWarnOpen(false);
    toast.success("Generating Excel...", {
      position: 'top-center',
      closeButton: false,
      description: `DTR for ${data.name} is being generated.`,
    });

    try {
      await generateDTRExcel(data);
      toast.success("DTR Downloaded", {
        position: 'top-center',
        closeButton: false,
        description: `Excel file has been saved successfully.`,
      });
    } catch (err) {
      console.error("Excel generation error:", err);
      toast.error("Generation Failed", {
        position: 'top-center',
        closeButton: false,
        description: "An error occurred while generating the Excel file.",
      });
    }
  };

  const handleResetAll = () => {
    const fallback = {
      name: "",
      leftPeriod: { from: new Date(), to: new Date() },
      rightPeriod: { from: new Date(), to: new Date() },
      leftOfficialHours: "",
      rightOfficialHours: "",
      leftRegularDaysHours: "",
      rightRegularDaysHours: "",
      leftSaturdaysHours: "",
      rightSaturdaysHours: "",
      days: Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        dayOff: false,
        morningArrival: "",
        morningDeparture: "",
        afternoonArrival: "",
        afternoonDeparture: "",
        overtimeHours: "",
        overtimeMinutes: "",
      })),
    };
    reset(fallback);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.success("Data Reset", {
      description: "All form inputs have been cleared.",
      position: "top-center",
      closeButton: false,
    });
  };

  const copyPreviousDay = (chronIndex: number) => {
    if (chronIndex === 0) return;
    const currentDayDate = sortedDates[chronIndex];
    const prevDayDate = sortedDates[chronIndex - 1];
    if (!currentDayDate || !prevDayDate) return;
    
    const currentIndex = currentDayDate.getDate() - 1;
    const prevIndex = prevDayDate.getDate() - 1;

    const prevDay = getValues(`days.${prevIndex}`);
    setValue(`days.${currentIndex}.dayType`, prevDay.dayType || (prevDay.dayOff ? "off" : "work"));
    setValue(`days.${currentIndex}.dayOff`, prevDay.dayOff);
    setValue(`days.${currentIndex}.morningArrival`, prevDay.morningArrival);
    setValue(`days.${currentIndex}.morningDeparture`, prevDay.morningDeparture);
    setValue(`days.${currentIndex}.afternoonArrival`, prevDay.afternoonArrival);
    setValue(`days.${currentIndex}.afternoonDeparture`, prevDay.afternoonDeparture);
    setValue(`days.${currentIndex}.overtimeHours`, prevDay.overtimeHours);
    setValue(`days.${currentIndex}.overtimeMinutes`, prevDay.overtimeMinutes);
  };

  const resetDay = (index: number) => {
    setValue(`days.${index}.dayType`, "work");
    setValue(`days.${index}.dayOff`, false);
    setValue(`days.${index}.morningArrival`, "");
    setValue(`days.${index}.morningDeparture`, "");
    setValue(`days.${index}.afternoonArrival`, "");
    setValue(`days.${index}.afternoonDeparture`, "");
    setValue(`days.${index}.overtimeHours`, "");
    setValue(`days.${index}.overtimeMinutes`, "");
  };

  const setDayType = (index: number, newType: "work" | "off" | "holiday") => {
    setValue(`days.${index}.dayType`, newType);
    setValue(`days.${index}.dayOff`, newType === "off"); // Set legacy flags
    if (newType !== "work") {
      setValue(`days.${index}.morningArrival`, "");
      setValue(`days.${index}.morningDeparture`, "");
      setValue(`days.${index}.afternoonArrival`, "");
      setValue(`days.${index}.afternoonDeparture`, "");
      setValue(`days.${index}.overtimeHours`, "");
      setValue(`days.${index}.overtimeMinutes`, "");
    }
  };

  const copyLeftToRightHours = () => {
    const vals = getValues();
    setValue("rightOfficialHours", vals.leftOfficialHours);
    setValue("rightRegularDaysHours", vals.leftRegularDaysHours);
    setValue("rightSaturdaysHours", vals.leftSaturdaysHours);
    toast.success("Copied Left Hours to Right", {
      position: 'top-center',
      closeButton: false,
    });
  };

  const copyRightToLeftHours = () => {
    const vals = getValues();
    setValue("leftOfficialHours", vals.rightOfficialHours);
    setValue("leftRegularDaysHours", vals.rightRegularDaysHours);
    setValue("leftSaturdaysHours", vals.rightSaturdaysHours);
    toast.success("Copied Right Hours to Left", {
      position: 'top-center',
      closeButton: false,
    });
  };

  const CUSTOM_HOURS_CHARACTERS_LENGTH = 72;

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Toaster position="top-right" richColors closeButton />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="mx-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Daily Time Record (DTR) Encoder</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Fill in the attendance details for Civil Service Form No. 48</p>
          </div>
          <div className="flex items-center gap-2 mx-2">
            <Sun className="h-4 w-4 text-amber-500" />
            <Switch
              checked={isDark}
              onCheckedChange={setIsDark}
              className="data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-amber-400 cursor-pointer"
            />
            <Moon className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-4">
          
          {/* Employee Details Card */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm rounded-md overflow-hidden dark:bg-slate-900">
            <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 pb-4">
              <CardTitle className="text-lg dark:text-slate-100">Employee Information</CardTitle>
              <CardDescription className="dark:text-slate-400">Basic details required for the top section of the form.</CardDescription>
            </CardHeader>
            <CardContent className="bg-white dark:bg-slate-900 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className={`text-xs font-medium ${errors.name ? "text-red-500 dark:text-red-500" : "text-slate-700 dark:text-slate-300"}`}>Name <span className="text-red-500">*</span></Label>
                  <Input id="name" maxLength={30} placeholder="E.g. GREGORIO, STELLA JOY D." {...register("name", { required: "Name is required" })} className={`shadow dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 dark:border-slate-600"}`} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leftPeriod" className="text-xs text-slate-700 dark:text-slate-300 font-medium"><span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800/60">Left</span> DTR Period</Label>
                  <Controller
                    control={control}
                    name="leftPeriod"
                    render={({ field }) => (
                      <DateRangePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rightPeriod" className="text-xs text-slate-700 dark:text-slate-300 font-medium"><span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-800/60">Right</span> DTR Period</Label>
                  <Controller
                    control={control}
                    name="rightPeriod"
                    render={({ field }) => (
                      <DateRangePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leftOfficialHours" className={`text-xs font-medium ${errors.leftOfficialHours ? "text-red-500 dark:text-red-500" : "text-slate-700 dark:text-slate-300"}`}><span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800/60">Left</span> Official Hours <span className="text-red-500">*</span></Label>
                  <Input id="leftOfficialHours" maxLength={CUSTOM_HOURS_CHARACTERS_LENGTH} placeholder="E.g. 8AM-5PM, 6AM-2PM..." {...register("leftOfficialHours", { required: "Left official hours are required" })} className={`shadow dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ${errors.leftOfficialHours ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 dark:border-slate-600"}`} />
                  {errors.leftOfficialHours && <p className="text-xs text-red-500">{errors.leftOfficialHours.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rightOfficialHours" className={`text-xs font-medium ${errors.rightOfficialHours ? "text-red-500 dark:text-red-500" : "text-slate-700 dark:text-slate-300"}`}><span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-800/60">Right</span> Official Hours <span className="text-red-500">*</span></Label>
                  <Input id="rightOfficialHours" maxLength={CUSTOM_HOURS_CHARACTERS_LENGTH} placeholder="E.g. 8AM-5PM, 6AM-2PM..." {...register("rightOfficialHours", { required: "Right official hours are required" })} className={`shadow dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ${errors.rightOfficialHours ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 dark:border-slate-600"}`} />
                  {errors.rightOfficialHours && <p className="text-xs text-red-500">{errors.rightOfficialHours.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leftRegularDaysHours" className={`text-xs font-medium ${errors.leftRegularDaysHours ? "text-red-500 dark:text-red-500" : "text-slate-700 dark:text-slate-300"}`}><span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800/60">Left</span> Arrival & Departure (Regular Days) <span className="text-red-500">*</span></Label>
                  <Input id="leftRegularDaysHours" maxLength={CUSTOM_HOURS_CHARACTERS_LENGTH} placeholder="E.g. 8AM-5PM, 6AM-2PM..." {...register("leftRegularDaysHours", { required: "Left arrival & departure is required" })} className={`shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ${errors.leftRegularDaysHours ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 dark:border-slate-600"}`} />
                  {errors.leftRegularDaysHours && <p className="text-xs text-red-500">{errors.leftRegularDaysHours.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rightRegularDaysHours" className={`text-xs font-medium ${errors.rightRegularDaysHours ? "text-red-500 dark:text-red-500" : "text-slate-700 dark:text-slate-300"}`}><span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-800/60">Right</span> Arrival & Departure (Regular Days) <span className="text-red-500">*</span></Label>
                  <Input id="rightRegularDaysHours" maxLength={CUSTOM_HOURS_CHARACTERS_LENGTH} placeholder="E.g. 8AM-5PM, 6AM-2PM..." {...register("rightRegularDaysHours", { required: "Right arrival & departure is required" })} className={`shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ${errors.rightRegularDaysHours ? "border-red-500 focus-visible:ring-red-500" : "border-slate-200 dark:border-slate-600"}`} />
                  {errors.rightRegularDaysHours && <p className="text-xs text-red-500">{errors.rightRegularDaysHours.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="leftSaturdaysHours" className="text-xs text-slate-700 dark:text-slate-300 font-medium"><span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800/60">Left</span> Arrival & Departure (Saturdays)</Label>
                  <Input id="leftSaturdaysHours" maxLength={CUSTOM_HOURS_CHARACTERS_LENGTH} placeholder="E.g. 8AM-5PM, 6AM-2PM..." {...register("leftSaturdaysHours")} className="shadow-sm border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rightSaturdaysHours" className="text-xs text-slate-700 dark:text-slate-300 font-medium"><span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-800/60">Right</span> Arrival & Departure (Saturdays)</Label>
                  <Input id="rightSaturdaysHours" maxLength={CUSTOM_HOURS_CHARACTERS_LENGTH} placeholder="E.g. 8AM-5PM, 6AM-2PM..." {...register("rightSaturdaysHours")} className="shadow-sm border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500" />
                </div>
                
                <div className="md:col-span-2 flex md:flex-row flex-col items-center justify-center gap-4">
                  <Button type="button" variant="secondary" size="sm" onClick={copyLeftToRightHours} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer">
                    Copy Left Hours to Right
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={copyRightToLeftHours} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    Copy Right Hours to Left
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timesheet Data Entry Card */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm rounded-md overflow-hidden flex flex-col dark:bg-slate-900">
            <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg dark:text-slate-100">Daily Time Grid</CardTitle>
                  <CardDescription className="dark:text-slate-400">Enter time data. You can copy the previous day's row for faster encoding.</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {/* 
              Table Wrapper: 
              Allows horizontal scroll if viewport is too narrow.
              Also constrained vertical height for huge tables to keep table headers sticky! 
            */}
              <Table 
                containerClassName="bg-white dark:bg-slate-900 border-b dark:border-slate-700 max-h-[600px]"
                className="min-w-[800px] w-full text-sm align-middle border-separate border-spacing-0 [&_td]:border-b [&_td]:border-slate-200 dark:[&_td]:border-slate-700"
              >
                <TableHeader className="sticky top-0 z-20">
                  <TableRow className="hover:bg-transparent">
                    <TableHead rowSpan={2} className="w-16 sticky left-0 z-30 text-center border border-slate-200 border-r dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 backdrop-blur-md">Day</TableHead>
                    <TableHead rowSpan={2} className="w-24 text-center border border-slate-200 border-r dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800/50 backdrop-blur-md">Type</TableHead>
                    <TableHead colSpan={2} className="text-center border-green-200 border dark:border-green-700 font-bold text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/50 backdrop-blur-md">Morning</TableHead>
                    <TableHead colSpan={2} className="text-center  border-yellow-200 border dark:border-yellow-700 font-bold text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/50 backdrop-blur-md">Afternoon</TableHead>
                    <TableHead colSpan={2} className="text-center  border-red-200 border dark:border-red-700 font-bold text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/50 backdrop-blur-md">Overtime</TableHead>
                    <TableHead rowSpan={2} className="w-20 text-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur-md">
                      <div className="flex justify-center items-center h-full">
                        <Settings2 className="w-4 h-4 text-slate-500" />
                      </div>
                    </TableHead>
                  </TableRow>
                  <TableRow className="hover:bg-transparent dark:bg-slate-800/50">
                    <TableHead className="text-center border-b border-slate-200 border-r dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold w-24 bg-white dark:bg-slate-800/50 backdrop-blur-md">Arrived</TableHead>
                    <TableHead className="text-center border-b border-slate-200 border-r dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold w-24 bg-white dark:bg-slate-800/50 backdrop-blur-md">Departure</TableHead>
                    <TableHead className="text-center border-b border-slate-200 border-r dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold w-24 bg-white dark:bg-slate-800/50 backdrop-blur-md">Arrived</TableHead>
                    <TableHead className="text-center border-b border-slate-200 border-r dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold w-24 bg-white dark:bg-slate-800/50 backdrop-blur-md">Departure</TableHead>
                    <TableHead className="text-center border-b border-slate-200 border-r dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold w-24 bg-white dark:bg-slate-800/50 backdrop-blur-md">Hours</TableHead>
                    <TableHead className="text-center border-b border-slate-200 border-r dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold w-24 bg-white dark:bg-slate-800/50 backdrop-blur-md">Minutes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedDates.map(group => (
                    <React.Fragment key={group.monthStr}>
                      <TableRow className="bg-white/50 dark:bg-slate-800/50 hover:bg-white/50 dark:hover:bg-slate-800/80 z-20">
                        <TableCell colSpan={9} className="bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 py-3 px-0 border-b border-t-0 dark:border-slate-700 shadow-sm z-20 sticky top-[96px]">
                          <div className="sticky left-4 w-fit inline-block">
                            {group.monthStr}
                          </div>
                        </TableCell>
                      </TableRow>
                      {group.dates.map(({ date, chronIndex }) => (
                        <DTRTableRow 
                          key={`date-${format(date, 'yyyy-MM-dd')}`}
                          index={date.getDate() - 1}
                          date={date}
                          chronIndex={chronIndex}
                          control={control}
                          register={register}
                          setValue={setValue}
                          copyPreviousDay={copyPreviousDay}
                          resetDay={resetDay}
                          setDayType={setDayType}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            
            <CardFooter className="bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row gap-2 justify-between items-center text-sm text-slate-500 dark:text-slate-400">
              <p className="text-xs">Pro Tip: Use the <Copy className="inline w-3 h-3"/> icon on the right to quickly duplicate the previous row.</p>
              <span className="text-xs">Showing <strong className="dark:text-slate-200">{sortedDates.length}</strong> valid days for the selected period(s).</span>
            </CardFooter>
          </Card>
          
        </form>

        <footer className="pt-10 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Made by <a href="https://github.com/kenfrianeza-dev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-all underline">Ken Frianeza</a>
          </p>
        </footer>

        {/* Bottom spacer so content isn't hidden behind floating button */}
        <div className="h-12 sm:h-8" />
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 gap-2 md:gap-3 pointer-events-none px-2">
        <AlertDialog open={emptyWarnOpen} onOpenChange={setEmptyWarnOpen}>
          <AlertDialogContent className="pointer-events-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Generate Empty DTR?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to generate the DTR without any time entries or statuses correctly filled out in the daily record. Are you sure you want to proceed with a blank daily record?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEmptyWarnOpen(false)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => pendingData && generateExcelSubmission(pendingData)} className="bg-blue-600 hover:bg-blue-700 text-white">Generate Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="pointer-events-auto h-10 px-4 md:h-12 md:px-6 text-sm md:text-base font-semibold shadow-lg dark:bg-white/10 text-red-600 dark:text-red-600 hover:text-red-500 hover:shadow-xl backdrop-blur-sm transition-all rounded-full cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 md:w-5 md:h-5 md:mr-2" />
              Reset Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="pointer-events-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to reset?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will completely clear all local inputs and start fresh. Your current timesheet will be erased.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAll} className="bg-rose-600 hover:bg-rose-700 text-white">Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={handleSubmit(onSubmit, onFormError)}
          className="pointer-events-auto h-10 px-5 md:h-12 md:px-8 font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all rounded-full text-sm md:text-base border border-blue-500/30 dark:border-blue-600/30 cursor-pointer"
        >
          <FileDown className="w-4 h-4 mr-1.5 md:w-5 md:h-5 md:mr-2" />
          Generate Excel
        </Button>
      </div>
    </div>
    </TooltipProvider>
  );
}
