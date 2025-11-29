export function generateGoogleCalendarUrl(
    flight: {
        flightNumber: string;
        startTime: string;
        endTime: string;
        startLocation: string;
        endLocation: string;
    },
    language: 'en' | 'ja' = 'ja'
): string {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const start = formatDate(flight.startTime);
    const end = formatDate(flight.endTime);

    let text, details;

    if (language === 'ja') {
        text = encodeURIComponent(`フライト ${flight.flightNumber}`);
        details = encodeURIComponent(`${flight.startLocation} から ${flight.endLocation} へのフライト`);
    } else {
        text = encodeURIComponent(`Flight ${flight.flightNumber}`);
        details = encodeURIComponent(`Flight from ${flight.startLocation} to ${flight.endLocation}`);
    }

    const location = encodeURIComponent(`${flight.startLocation} to ${flight.endLocation}`);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}
