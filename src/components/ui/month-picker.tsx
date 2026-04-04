import * as React from "react"
import { format, setMonth, setYear } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec",
]

interface MonthPickerProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
}

function MonthPicker({ value, onChange, className }: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewYear, setViewYear] = React.useState(value.getFullYear())

  const selectedMonth = value.getMonth()
  const selectedYear = value.getFullYear()

  React.useEffect(() => {
    if (open) {
      setViewYear(value.getFullYear())
    }
  }, [open, value])

  const handleMonthSelect = (monthIndex: number) => {
    let newDate = setMonth(value, monthIndex)
    newDate = setYear(newDate, viewYear)
    onChange(newDate)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal shadow-sm border-slate-200 h-9 px-3 rounded-md",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 dark:text-slate-200" />
          {format(value, "MMMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4 rounded-xl" align="start">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-slate-100"
            onClick={() => setViewYear((y) => y - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold dark:text-slate-200">{viewYear}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-slate-100"
            onClick={() => setViewYear((y) => y + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((monthLabel, idx) => {
            const isSelected = idx === selectedMonth && viewYear === selectedYear
            return (
              <Button
                key={monthLabel}
                variant={isSelected ? "default" : "ghost"}
                className={cn(
                  "h-9 text-sm font-medium rounded-lg transition-all",
                  isSelected
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    : "dark:text-slate-200 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={() => handleMonthSelect(idx)}
              >
                {monthLabel}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MonthPicker }
