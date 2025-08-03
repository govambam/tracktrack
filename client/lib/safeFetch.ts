// Safe fetch utility that completely avoids response body consumption issues
export async function safeFetch(url: string, options: RequestInit = {}): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  data?: any;
  text?: string;
  error?: string;
}> {
  console.log('SafeFetch: Making request to', url);

  try {
    // Create the fetch request
    const response = await fetch(url, {
      ...options,
      cache: 'no-cache',
      headers: {
        ...options.headers,
      }
    });

    console.log('SafeFetch: Response received', response.status, response.statusText);

    // For error responses, don't try to read the body at all
    if (!response.ok) {
      console.log('SafeFetch: Non-OK response, not reading body to avoid consumption issues');
      return {
        ok: false,
        status: response.status,
        statusText: response.statusText,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    // Only read body for successful responses
    let data: any = undefined;
    let responseText = '';

    try {
      // Clone the response before reading to be extra safe
      const responseClone = response.clone();
      responseText = await responseClone.text();
      console.log('SafeFetch: Successfully read response text, length:', responseText.length);

      if (responseText) {
        try {
          data = JSON.parse(responseText);
          console.log('SafeFetch: Successfully parsed JSON');
        } catch (parseError) {
          console.warn('SafeFetch: Response is not JSON, returning as text');
          // Not an error - some responses might not be JSON
        }
      }
    } catch (readError) {
      console.error('SafeFetch: Failed to read successful response:', readError);
      // Even if we can't read the body, we know the request was successful
      return {
        ok: true,
        status: response.status,
        statusText: response.statusText,
        error: 'Could not read response body'
      };
    }

    return {
      ok: true,
      status: response.status,
      statusText: response.statusText,
      data,
      text: responseText
    };

  } catch (error) {
    console.error('SafeFetch: Request failed:', error);
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
