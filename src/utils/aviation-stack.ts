import { AviationStackFlightResponse } from '../types/aviation-stack';

const API_BASE_URL = 'http://api.aviationstack.com/v1';

interface FetchFlightsOptions {
    flightNumber?: string;
    dep_iata?: string;
    arr_iata?: string;
    limit?: number;
}

export async function fetchFlights(options: FetchFlightsOptions = {}): Promise<AviationStackFlightResponse> {
    const apiKey = process.env.AVIATION_STACK_API_KEY;

    if (!apiKey) {
        throw new Error('AVIATION_STACK_API_KEY is not defined in environment variables');
    }

    const params = new URLSearchParams({
        access_key: apiKey,
    });

    if (options.flightNumber) {
        params.append('flight_iata', options.flightNumber);
    }

    if (options.dep_iata) {
        params.append('dep_iata', options.dep_iata);
    }

    if (options.arr_iata) {
        params.append('arr_iata', options.arr_iata);
    }

    if (options.limit) {
        params.append('limit', options.limit.toString());
    }

    const url = `${API_BASE_URL}/flights?${params.toString()}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Aviation Stack API error: ${response.status} ${response.statusText}`);
        }

        const data = (await response.json()) as AviationStackFlightResponse;

        // Basic error check for API-level errors that come as 200 OK but with error field
        // The type definition doesn't include 'error' field but the API might return it.
        // For now, we assume the happy path matches the interface.

        return data;
    } catch (error) {
        console.error('Failed to fetch flights:', error);
        throw error;
    }
}
