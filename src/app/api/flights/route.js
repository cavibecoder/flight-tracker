import { NextResponse } from 'next/server';
import { fetchFlights } from '../../../utils/aviation-stack';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flightNumber');
  const departureIata = searchParams.get('departureIata');
  const arrivalIata = searchParams.get('arrivalIata');

  if (!flightNumber && (!departureIata || !arrivalIata)) {
    return NextResponse.json({ error: 'Either flight number OR both departure and arrival IATA codes are required' }, { status: 400 });
  }

  try {
    const fetchOptions = { limit: 1 };
    if (flightNumber) {
      fetchOptions.flightNumber = flightNumber;
    } else {
      fetchOptions.dep_iata = departureIata;
      fetchOptions.arr_iata = arrivalIata;
    }

    const response = await fetchFlights(fetchOptions);

    if (response.data && response.data.length > 0) {
      const flight = response.data[0];

      // Map API response to the format expected by the frontend
      const mappedFlight = {
        flightNumber: flight.flight.iata || flight.flight.number,
        startTime: flight.departure.scheduled,
        endTime: flight.arrival.scheduled,
        startLocation: `${flight.departure.airport || 'Unknown'} (${flight.departure.iata || '-'})`,
        endLocation: `${flight.arrival.airport || 'Unknown'} (${flight.arrival.iata || '-'})`,
        timeZone: `${flight.departure.timezone || '-'} / ${flight.arrival.timezone || '-'}`,
        status: flight.flight_status,
      };

      return NextResponse.json([mappedFlight]);
    } else {
      return NextResponse.json([], { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return NextResponse.json({ error: `Failed to fetch flight data: ${error.message}` }, { status: 500 });
  }
}
