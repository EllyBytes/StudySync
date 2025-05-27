function Schedule({ schedule }) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold">Study Schedule</h2>
      {schedule.length === 0 ? (
        <p>No schedule generated yet.</p>
      ) : (
        <ul className="space-y-2">
          {schedule.map((item, index) => (
            <li key={index} className="border p-2 rounded">
              {item.subject}: {item.hours} hours on {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}
              {item.recurrence !== 'none' && ` (Recurs ${item.recurrence})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Schedule;