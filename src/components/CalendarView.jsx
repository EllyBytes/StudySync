import { useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const localizer = momentLocalizer(moment);

function CalendarView({ schedule, exportIcsCalendar }) {
  const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 27)); // May 27, 2025
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 4, 27));

  // Color mapping for subjects
  const subjectColors = {
    maths: '#3B82F6',    // Blue
    physics: '#10B981',  // Green
    chemistry: '#F59E0B', // Yellow
    biology: '#EF4444',  // Red
    default: '#6B7280',  // Gray
  };

  // Flatten the schedule and map to calendar events
  const events = schedule
    .flatMap(day =>
      day.slots.map(slot => {
        const start = new Date(`${day.date}T${slot.startTime}:00`);
        const end = new Date(`${day.date}T${slot.endTime}:00`);
        const hours = (end - start) / (1000 * 60 * 60);
        return {
          title: `${slot.subject} (${hours.toFixed(1)}h)`,
          start,
          end,
          subject: slot.subject,
          recurrence: 'none',
        };
      })
    )
    .filter(event => event.start && event.end && !isNaN(event.start) && !isNaN(event.end));

  // Get sessions for the selected date
  const dailySchedule = schedule
    .flatMap(day =>
      day.slots.map(slot => {
        const start = new Date(`${day.date}T${slot.startTime}:00`);
        const end = new Date(`${day.date}T${slot.endTime}:00`);
        const hours = (end - start) / (1000 * 60 * 60);
        return {
          subject: slot.subject,
          startTime: start,
          endTime: end,
          hours: hours.toFixed(1),
          recurrence: 'none',
        };
      })
    )
    .filter(item => {
      const sessionDate = new Date(item.startTime);
      return (
        sessionDate.getFullYear() === selectedDate.getFullYear() &&
        sessionDate.getMonth() === selectedDate.getMonth() &&
        sessionDate.getDate() === selectedDate.getDate()
      );
    });

  const handleExportPDF = async () => {
    if (!calendarRef.current) return;

    try {
      const canvas = await html2canvas(calendarRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 277; // A4 height minus margins
      let position = 10;

      pdf.setFontSize(16);
      pdf.text('Study Schedule', 10, 10);
      position += 10;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        position += imgHeight + 10;
      } else {
        let heightLeft = imgHeight;
        let y = 0;

        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, undefined, 0, y);
          heightLeft -= pageHeight;
          y -= pageHeight * (canvas.width / imgWidth);
          if (heightLeft > 0) {
            pdf.addPage();
            position = 10;
          }
        }
        position = 10;
      }

      pdf.setFontSize(12);
      pdf.text(`Schedule for ${selectedDate.toLocaleDateString()}`, 10, position);
      position += 10;

      if (dailySchedule.length === 0) {
        pdf.text('No sessions scheduled.', 10, position);
      } else {
        dailySchedule.forEach(item => {
          const text = `${item.subject}: ${item.hours}h, ${new Date(item.startTime).toLocaleTimeString()} - ${new Date(item.endTime).toLocaleTimeString()}${item.recurrence !== 'none' ? ` (Recurs ${item.recurrence})` : ''}`;
          pdf.text(text, 10, position);
          position += 10;
          if (position > pageHeight) {
            pdf.addPage();
            position = 10;
          }
        });
      }

      pdf.save('study-schedule.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = subjectColors[event.subject.toLowerCase()] || subjectColors.default;
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      padding: '2px 5px',
      fontSize: '14px',
    };
    return { style };
  };

  const handleNavigate = (newDate, view, action) => {
    setCalendarDate(newDate);
    if (action === 'TODAY') {
      setSelectedDate(new Date(2025, 4, 27));
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-6">Study Schedule</h2>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={exportIcsCalendar}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
        >
          Export ICS
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition-colors"
        >
          Export PDF
        </button>
      </div>
      <div ref={calendarRef} className="bg-white p-6 rounded-lg shadow-md">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={['month']}
          date={calendarDate}
          onNavigate={handleNavigate}
          onSelectSlot={handleSelectSlot}
          selectable
          style={{ height: 600 }}
          className="rbc-calendar"
          eventPropGetter={eventStyleGetter}
          formats={{
            eventTimeRangeFormat: null,
            monthHeaderFormat: 'MMMM YYYY',
          }}
          components={{
            event: ({ event }) => (
              <span className="text-sm">{event.title}</span>
            ),
          }}
        />
      </div>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Schedule for {selectedDate.toLocaleDateString()}
        </h3>
        {dailySchedule.length === 0 ? (
          <p className="text-gray-500">No sessions scheduled for this day.</p>
        ) : (
          <ul className="space-y-2">
            {dailySchedule.map((item, index) => (
              <li
                key={index}
                className={`border-l-4 pl-4 py-2 bg-gray-50 rounded`}
                style={{ borderColor: subjectColors[item.subject.toLowerCase()] || subjectColors.default }}
              >
                <span className="font-medium">{item.subject}</span>: {item.hours}h,{' '}
                {new Date(item.startTime).toLocaleTimeString()} -{' '}
                {new Date(item.endTime).toLocaleTimeString()}
                {item.recurrence !== 'none' && (
                  <span className="text-sm text-gray-600"> (Recurs {item.recurrence})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CalendarView;