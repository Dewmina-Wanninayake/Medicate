import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { buttonVariants } from "./button";

const Calendar = ({
  className,
  selected,
  onSelect,
  modifiers = {},
  modifiersStyles = {},
  ...props
}) => {
  const [viewDate, setViewDate] = React.useState(selected || new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month's days
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const isSelected = selected && date.toDateString() === (selected instanceof Date ? selected.toDateString() : new Date(selected).toDateString());
      const isToday = date.toDateString() === new Date().toDateString();
      
      // Handle modifiers
      let customStyle = {};
      Object.keys(modifiers).forEach(key => {
        if (modifiers[key](date)) {
          customStyle = { ...customStyle, ...modifiersStyles[key] };
        }
      });

      // Special style for currently selected date: Dotted line circle
      if (isSelected) {
        customStyle = { 
          ...customStyle, 
          border: '2px dashed var(--primary)', 
          borderRadius: '50%',
          backgroundColor: customStyle.backgroundColor || 'transparent',
          color: customStyle.color || (customStyle.backgroundColor ? 'white' : 'var(--primary)')
        };
      }

      days.push(
        <button
          key={date.toISOString()}
          onClick={() => onSelect(date)}
          style={customStyle}
          className={cn(
            "h-11 w-11 p-0 font-medium flex items-center justify-center transition-all hover:bg-accent/20 rounded-full text-base",
            isToday && !isSelected && "bg-primary/10 text-primary border border-primary/20",
            isSelected && "scale-110 shadow-sm",
            className
          )}
        >
          {d}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <button
          onClick={handleNextMonth}
          className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
          <div key={day} className="w-9">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-3 sm:gap-4">
        {renderDays()}
      </div>
    </div>
  );
};

export { Calendar };
