function formatMessageDate(inputDate) {
    // Parse the input string as a UTC date
    const utcDate = new Date(inputDate.replace(" ", "T") + "Z");

    // Current date for comparison
    const now = new Date();

    // Calculate difference in days (adjusting for time zones by using UTC day)
    const dayDifference = Math.floor((now.getTime() - utcDate.getTime()) / (1000 * 60 * 60 * 24));

    // Time formatting in HH:MM AM/PM
    const formattedTime = utcDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    if (dayDifference === 0) {
        return { readable: formattedTime, utcTimestamp: utcDate.toISOString() };
    } else if (dayDifference === 1) {
        return { readable: `Yesterday, ${formattedTime}`, utcTimestamp: utcDate.toISOString() };
    } else {
        const formattedDate = utcDate.toLocaleDateString("en-GB");
        return { readable: formattedDate, utcTimestamp: utcDate.toISOString() };
    }
    
}



// Example Usage
const inputDate = "2024-09-29 17:49:58";
console.log(formatMessageDate(inputDate));
console.log(new Date(Date.now()).toISOString().replace('T', ' ').replace(RegExp('.[0-9]+Z'), ''))


