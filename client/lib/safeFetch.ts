// Safe fetch utility that handles response body consumption issues
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
    // Create a completely new fetch request
    const response = await fetch(url, {
      ...options,
      // Ensure we get a fresh response
      cache: 'no-cache',
      headers: {
        ...options.headers,
      }
    });

    console.log('SafeFetch: Response received', response.status, response.statusText);
    console.log('SafeFetch: Body used status:', response.bodyUsed);

    // Check if body is already consumed
    if (response.bodyUsed) {
      console.error('SafeFetch: Response body already consumed');
      return {
        ok: false,
        status: response.status,
        statusText: response.statusText,
        error: 'Response body already consumed'
      };
    }

    // Read response as text (safest method)
    let responseText: string;
    try {
      responseText = await response.text();
      console.log('SafeFetch: Successfully read response text, length:', responseText.length);
    } catch (readError) {
      console.error('SafeFetch: Failed to read response text:', readError);
      return {
        ok: false,
        status: response.status,
        statusText: response.statusText,
        error: 'Failed to read response body'
      };
    }

    // Parse JSON if response is successful
    let data: any = undefined;
    if (response.ok && responseText) {
      try {
        data = JSON.parse(responseText);
        console.log('SafeFetch: Successfully parsed JSON');
      } catch (parseError) {
        console.warn('SafeFetch: Failed to parse JSON, returning text:', parseError);
        // Don't treat this as an error, some responses might not be JSON
      }
    }

    return {
      ok: response.ok,
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
